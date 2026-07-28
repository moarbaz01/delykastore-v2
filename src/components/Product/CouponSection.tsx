import Label from "./Label";

interface CouponSectionProps {
  appliedCoupon: any;
  couponCode: string;
  couponError: string;
  isCheckingCoupon: boolean;
  setCouponCode: (value: string) => void;
  handleApplyCoupon: () => void;
  removeCoupon: () => void;
}

const CouponSection = ({
  appliedCoupon,
  couponCode,
  couponError,
  isCheckingCoupon,
  setCouponCode,
  handleApplyCoupon,
  removeCoupon,
}: CouponSectionProps) => {
  return (
    <div
      className="p-4 rounded-2xl relative"
      style={{ background: "#12102A", border: "1px solid rgba(168,85,247,0.15)" }}
    >
      <Label text={"Apply Coupon"} number={appliedCoupon ? "✓" : "3"} />

      <div className="mt-4 flex flex-col gap-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={!!appliedCoupon}
            className="flex-1 rounded-xl text-white placeholder:text-gray-500 text-sm py-2.5 px-4 transition-all duration-200 focus:outline-none disabled:opacity-50"
            style={{
              background: "#0D0B1A",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(168,85,247,0.6)";
              e.target.style.boxShadow = "0 0 0 3px rgba(168,85,247,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(168,85,247,0.2)";
              e.target.style.boxShadow = "none";
            }}
          />
          {appliedCoupon ? (
            <button
              onClick={removeCoupon}
              className="px-4 py-2 rounded-xl text-red-400 text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
              style={{ border: "1px solid rgba(239,68,68,0.3)" }}
            >
              Remove
            </button>
          ) : (
            <button
              onClick={handleApplyCoupon}
              disabled={isCheckingCoupon || !couponCode.trim()}
              className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #A855F7 100%)" }}
            >
              {isCheckingCoupon ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          )}
        </div>

        {couponError && (
          <p className="text-red-400 text-xs px-1">{couponError}</p>
        )}

        {appliedCoupon && (
          <div
            className="rounded-xl p-3 text-sm"
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <p className="font-bold text-green-400">
              {appliedCoupon.couponDetails?.type === "percentage"
                ? `🎉 ${appliedCoupon.discount}% discount applied!`
                : `🎉 $${appliedCoupon.discount} discount applied!`}
            </p>
            {appliedCoupon.couponDetails?.minAmount && (
              <p className="text-green-400/70 text-xs mt-1">
                Valid on orders over ${appliedCoupon.couponDetails.minAmount}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponSection;
