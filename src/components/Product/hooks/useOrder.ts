import { useCallback, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { encryptData } from "@/utils/encryption";

import { useSession } from "next-auth/react";

export const useOrder = (setPaymentData: (value: any) => void) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const createOrder = useCallback(
    async (params: {
      userId: string;
      zoneId: string;
      urlLink?: string;
      amountSelected: {
        id: string;
        amount: string;
        price: string;
        durationDays?: number;
      };
      isAgree: boolean;
      stock: boolean;
      game: string;
      type: "account" | "topup" | "digital-service";
      isApi: boolean;
      playerAvailable: boolean;
      name: string;
      _id: string;
      region?: string;
      appliedCoupon: any;
    }) => {
      const {
        userId,
        zoneId,
        urlLink,
        amountSelected,
        isAgree,
        stock,
        game,
        isApi,
        playerAvailable,
        name,
        _id,
        region,
        type,
        appliedCoupon,
      } = params;

      if (type === "account" && !session) {
        toast.error("Please login");
        return;
      }

      if (type === "topup" && !userId) {
        toast.error("Please fill UserId");
        return;
      }

      if (isApi) {
        if (["mobilelegends", "magicchess", "genshinimpact"].includes(game)) {
          if (!zoneId) {
            toast.error("Please fill ZoneId");
            return;
          }

          if (!playerAvailable) {
            toast.error("Please check role");
            return;
          }
        }
      }

      if (!amountSelected.id) {
        toast.error("Please select amount");
        return;
      }

      if (!isAgree) {
        toast.error("Please agree to the terms and conditions");
        return;
      }

      if (!stock) {
        toast.error("Product is out of stock");
        return;
      }

      const orderParams = {
        name,
        costId: amountSelected.id,
        orderDetails:
          amountSelected.amount ||
          (amountSelected.durationDays
            ? `${amountSelected.durationDays} Days`
            : "Package"),
        orderType: isApi ? "API Order" : "Custom Order",
        userId: userId?.trim(),
        zoneId: zoneId?.trim(),
        urlLink: urlLink?.trim(),
        game,
        region,
        productId: _id,
        couponCode: appliedCoupon?.code,
        isCouponApplied: !!appliedCoupon,
        user: session?.user?.id,
      };

      const encryptedPayload = encryptData(orderParams);

      try {
        setIsLoading(true);
        const res = await axios.post(
          "/api/payway/create-transaction",
          { payload: encryptedPayload },
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        if (res.status === 200) {
          setPaymentData(res.data);
        }
      } catch (error) {
        toast.error("Error Creating Order");
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setPaymentData],
  );

  const testOrder = useCallback(async (orderId: string) => {
    try {
      setIsLoading(true);
      const res = await axios.post("/api/test/fulfill", { orderId });
      if (res.status === 200) {
        toast.success("Test Order Successful!");
        window.location.href = "/order-history";
      }
    } catch (error: any) {
      toast.error(
        `Test Order Failed: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createOrder, testOrder, isLoading };
};
