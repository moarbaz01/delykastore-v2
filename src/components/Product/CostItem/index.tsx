import { BackgroundGradient } from "@/components/ui/BackgroundGradient";
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
    >
      <BackgroundGradient
        className={`rounded-2xl sm:rounded-3xl ${
          `${amountSelected?.id + amountSelected?.amount}` ===
          `${item.id + item.amount}`
            ? "bg-transparent"
            : "bg-black"
        } cursor-pointer justify-between transition p-1.5 sm:p-2 min-h-12 sm:min-h-16 flex relative gap-1.5 sm:gap-2 items-center`}
      >
        {item.note && (
          <div className="bg-red-400 rounded-tr-md -top-2 sm:-top-3 -left-0.5 sm:-left-1 absolute px-1 py-0.5 sm:p-[4px] text-[8px] sm:text-[10px] leading-none">
            {item.note}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base sm:text-xl leading-tight">${item.price}</p>
          <p className="text-[10px] sm:text-sm   max-w-full">
            {item.amount}
          </p>
        </div>

        <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex-shrink-0">
          {item.image && (
            <Image
              src={item.image}
              alt="diamond"
              width={100}
              height={100}
              className="h-full w-full aspect-square object-contain"
            />
          )}
        </div>
      </BackgroundGradient>
    </div>
  );
};

export default CostItem;