import { ShoppingCart } from "lucide-react";

interface PaymentSummaryProps {
  appliedCoupon: any;
  amountSelected: {
    id: string;
    amount: string;
    price: string;
  };
  total: string;
  isAgree: boolean;
  game: string;
  type: string;
  playerAvailable: boolean;
  createOrder: () => void;
  isLoading?: boolean;
}

const PaymentSummary = ({
  appliedCoupon,
  amountSelected,
  total,
  isAgree,
  game,
  type,
  playerAvailable,
  createOrder,
  isLoading = false,
}: PaymentSummaryProps) => {
  const isDisabled =
    !isAgree ||
    !amountSelected.id ||
    (type !== "account" && game !== "Custom Game" && !playerAvailable);

  return (
    <div className="md:static z-[50] fixed bottom-0 left-0 w-full">
      <div
        className="text-gray-900 p-4 flex flex-row items-center justify-between gap-4 transition-all duration-300 md:rounded-2xl rounded-t-3xl md:border md:border-pink-500/15 shadow-[0_-10px_30px_rgba(255,117,151,0.15)] md:shadow-none"
        style={{
          background: "rgba(255, 255, 255, 0.95)", // #FFFFFF with opacity
          borderTop: "1px solid rgba(255,117,151,0.2)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Price summary */}
        <div className="space-y-0 flex-1 pl-2 md:pl-0">
          <p className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mb-0.5">Total Amount</p>
          <div className="flex items-center gap-2">
            <p
              className="text-2xl font-black"
              style={{
                background: "linear-gradient(to right, #E55577, #FF7597)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ${total}
            </p>
            {appliedCoupon && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                -${(parseFloat(amountSelected.price) - parseFloat(total)).toFixed(2)}
              </span>
            )}
          </div>
          {amountSelected.amount && (
            <p className="text-[11px] text-gray-600 font-medium truncate max-w-[150px]">
              {amountSelected.amount}
            </p>
          )}
        </div>

        {/* Pay button */}
        <button
          disabled={isDisabled}
          onClick={createOrder}
          className={`relative overflow-hidden px-8 py-3.5 rounded-full text-[15px] font-bold transition-all duration-300 min-w-[140px] flex items-center justify-center gap-2 ${
            isDisabled 
              ? "cursor-not-allowed text-gray-500" 
              : "text-white hover:shadow-[0_0_30px_rgba(255,117,151,0.6)] hover:-translate-y-0.5 active:translate-y-0 animate-pulse-glow"
          }`}
          style={{
            background: isDisabled
              ? "rgba(255,117,151,0.2)"
              : "linear-gradient(135deg, #E55577 0%, #FF7597 100%)",
            border: isDisabled ? "none" : "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {/* Shine effect on button */}
          {!isDisabled && (
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-shimmer" />
          )}

          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart size={18} />
              Pay Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentSummary;
