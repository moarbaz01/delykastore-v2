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
        className={`rounded-3xl ${
          `${amountSelected?.id + amountSelected?.amount}` ===
          `${item.id + item.amount}`
            ? "bg-transparent"
            : "bg-black"
        } cursor-pointer   justify-between  transition p-2 min-h-16 flex relative gap-2 items-center`}
      >
        {item.note && (
          <div className="bg-red-400 rounded-tr-md -top-3 -left-1 absolute p-[4px] text-[10px]">
            {item.note}
          </div>
        )}
        <div className="flex-1">
          <p className="font-bold text-xl">${item.price}</p>
          <p className="md:text-sm text-nowrap text-[11px]">{item.amount}</p>
        </div>

        <div className="md:h-14 md:w-14 h-12 w-12  ">
          {item.image && (
            <Image
              src={item.image}
              alt="diamond"
              width={100}
              height={100}
              className="h-full w-full aspect-auto"
            />
          )}
        </div>
      </BackgroundGradient>
    </div>
  );
};

export default CostItem;
