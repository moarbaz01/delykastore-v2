import { useCallback, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { encryptData } from "@/utils/encryption";

export const useOrder = (setPaymentData: (value: any) => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const createOrder = useCallback(
    async (params: {
      userId: string;
      zoneId: string;
      amountSelected: { id: string; amount: string; price: string };
      isAgree: boolean;
      stock: boolean;
      game: string;
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
        amountSelected,
        isAgree,
        stock,
        game,
        isApi,
        playerAvailable,
        name,
        _id,
        region,
        appliedCoupon,
      } = params;

      if (!userId) {
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
        orderDetails: amountSelected.amount,
        orderType: isApi ? "API Order" : "Custom Order",
        userId: userId?.trim(),
        zoneId: zoneId?.trim(),
        game,
        region,
        productId: _id,
        couponCode: appliedCoupon?.code,
        isCouponApplied: !!appliedCoupon,
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
    [setPaymentData],
  );

  return { createOrder, isLoading };
};
