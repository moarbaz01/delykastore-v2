import Image from "next/image";

const CostItem = ({ item, i, amountSelected, setAmountSelected }) => {
  const isSelected = amountSelected?.id === item.id;
  const isDisabled = item.slots !== undefined && item.slots === 0;

  return (
    <div
      onClick={() =>
        !isDisabled &&
        setAmountSelected({
          id: item.id,
          amount: item.amount,
          durationDays: item.durationDays,
          price: item.price,
        })
      }
      className={`rounded-lg bg-card-bg transition p-3 flex relative gap-6 items-center ${
        isDisabled
          ? "opacity-50 grayscale cursor-not-allowed pointer-events-none"
          : "cursor-pointer hover:border-2 hover:border-primary"
      } ${isSelected ? "border-2 border-primary" : "border-2 border-card-bg"}`}
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
        <p className="text-sm text-white leading-tight">
          {item.amount || `${item.durationDays} Days`}
          {item.slots !== undefined && (
            <span
              className={`text-[12px] ml-2 ${item.slots > 0 ? "text-primary" : "text-red-400"}`}
            >
              {item.slots > 0 ? `(${item.slots} Slots)` : "(No Stock)"}
            </span>
          )}
        </p>
        <p className="font-bold text-primary text-base">USD {item.price}</p>
      </div>

      {isSelected && (
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
