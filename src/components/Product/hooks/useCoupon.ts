import { useCallback } from "react";
import toast from "react-hot-toast";

interface ApplyCouponParams {
  couponCode: string;
  amountSelected: { id: string; price: string; amount: string };
  _id: string;
}

export const useCoupon = (
  setIsCheckingCoupon: (value: boolean) => void,
  setCouponError: (value: string) => void,
  setAppliedCoupon: (value: any) => void
) => {
  const applyCoupon = useCallback(
    async ({ couponCode, amountSelected, _id }: ApplyCouponParams) => {
      if (!couponCode.trim()) {
        setCouponError("Please enter a coupon code");
        return;
      }

      if (!amountSelected?.id) {
        setCouponError("Please select a purchase option");
        return;
      }

      try {
        setIsCheckingCoupon(true);
        setCouponError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/coupon/validate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              coupon: couponCode.trim(),
              costId: amountSelected.id,
              price: amountSelected.price,
              productId: _id,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to apply coupon");
        }

        setAppliedCoupon({
          code: couponCode,
          discount: data.discount,
          finalPrice: data.finalPrice,
          couponDetails: data.couponDetails,
          minAmount: data.couponDetails?.minAmount || 0,
        });

        toast.success(data.message || "Coupon applied successfully!");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to apply coupon. Please try again.";
        setCouponError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsCheckingCoupon(false);
      }
    },
    [setIsCheckingCoupon, setCouponError, setAppliedCoupon]
  );

  const removeCoupon = useCallback(
    (setAppliedCoupon: (value: any) => void, setCouponCode: (value: string) => void, setCouponError: (value: string) => void) => {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponError("");
      toast.success("Coupon removed successfully!");
    },
    []
  );

  return { applyCoupon, removeCoupon };
};
