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
  playerAvailable: boolean;
  createOrder: () => void;
}

const PaymentSummary = ({
  appliedCoupon,
  amountSelected,
  total,
  isAgree,
  game,
  playerAvailable,
  createOrder,
}: PaymentSummaryProps) => {
  return (
    <div className="md:static z-[50] fixed bottom-0 left-0 w-full ">
      <div className="bg-secondary md:rounded-lg md:border md:border-gray-600 text-white p-4 flex items-center justify-between">
        <div>
          <div className="text-lg">
            {appliedCoupon && (
              <>
                <div className="flex items-center gap-2">
                  <span>Original:</span>
                  <span className="line-through">${amountSelected.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Discount:</span>
                  <span className="text-primary">
                    -$
                    {(
                      parseFloat(amountSelected.price) - parseFloat(total)
                    ).toFixed(2)}
                  </span>
                </div>
              </>
            )}
            <p className="text-primary font-bold">
              TOTAL : <span>{total}$</span>
            </p>
          </div>
          <p className="text-gray-200 font-extrabold">
            {amountSelected.amount}
          </p>
        </div>
        <button
          disabled={
            !isAgree ||
            (game === "mobilelegends" && !playerAvailable) ||
            !amountSelected.id
          }
          onClick={createOrder}
          className="bg-primary disabled:opacity-50 w-[100px] rounded-lg p-2 text-black font-bold"
        >
          បង់ ឥឡូវ
        </button>
      </div>
    </div>
  );
};

export default PaymentSummary;
