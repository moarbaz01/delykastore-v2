import Image from "next/image";

const CostItem = ({ item, i, amountSelected, setAmountSelected }) => {
  return (
    <div
      onClick={() =>
        setAmountSelected({
          id: item.id,
          amount: item.amount,
          price: item.price,
        })
      }
      className={`rounded-lg bg-card-bg  hover:border-2 hover:border-primary ${
        `${amountSelected?.id + amountSelected?.amount}` ===
        `${item.id + item.amount}`
          ? "border-2 border-primary"
          : "border-2 border-card-bg"
      } cursor-pointer justify-between transition p-3 flex relative gap-6 items-center`}
    >
      {item.note && (
        <div className="bg-primary text-black rounded-tr-md -top-2 -left-0.5 absolute px-2 py-1 text-xs leading-none">
          {item.note}
        </div>
      )}

      <div className="h-12 w-12 flex-shrink-0">
        {item.image && (
          <Image
            src={item.image}
            alt="diamond"
            width={48}
            height={48}
            className="h-full w-full object-contain"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-tight">{item.amount}</p>
        <p className="font-bold text-primary text-base">USD {item.price}</p>
      </div>

      {`${amountSelected?.id + amountSelected?.amount}` ===
        `${item.id + item.amount}` && (
        <div className="bg-primary rounded-bl-lg absolute top-0 right-0 p-1.5">
          <svg
            className="w-4 h-4 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default CostItem;
