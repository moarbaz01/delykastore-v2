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
    <div className="p-4 relative bg-secondary border border-gray-600 rounded-lg">
      <Label text={"អនុវត្តកូដកា"} number={appliedCoupon ? "✓" : "3"} />

      <div className="mt-4 flex flex-col gap-2">
        <input
          type="text"
          placeholder="បញ្ចូលកូដកាត"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          disabled={!!appliedCoupon}
          className="flex-1 rounded-lg bg-card-bg text-white placeholder:text-gray-400 focus:outline-primary focus:outline py-2 px-4"
        />

        {couponError && <p className="text-red-500 text-sm">{couponError}</p>}

        {appliedCoupon && (
          <div className="bg-green-100 text-green-800 p-2 rounded-lg">
            <p className="font-bold">
              {appliedCoupon.couponDetails?.type === "percentage"
                ? `បញ្ចុះតម្លៃ ${appliedCoupon.discount}% ត្រូវបានអនុវត្ត!`
                : `បញ្ចុះតម្លៃ $${appliedCoupon.discount} ត្រូវបានអនុវត្ត!`}
            </p>
            {appliedCoupon.couponDetails?.minAmount && (
              <p className="text-sm">
                មានសុពលភាពលើការបញ្ជាទិញលើសពី $
                {appliedCoupon.couponDetails.minAmount}
              </p>
            )}
          </div>
        )}

        {appliedCoupon ? (
          <button
            onClick={removeCoupon}
            className="bg-primary w-24 rounded-lg p-2 text-black font-bold"
          >
            លុបចោល
          </button>
        ) : (
          <button
            onClick={handleApplyCoupon}
            disabled={isCheckingCoupon || !couponCode.trim()}
            className="bg-primary md:w-24 w-full rounded-lg p-2 mx-auto text-black font-bold disabled:opacity-50"
          >
            {isCheckingCoupon ? (
              <span className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-1 h-4 w-4 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                កំពុងអនុវត្ត
              </span>
            ) : (
              "អនុវត្ត"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CouponSection;
