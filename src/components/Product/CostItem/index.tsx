import Image from "next/image";
import { getOptimizedUrl } from "@/utils/optimizeImage";

const CostItem = ({ item, i, amountSelected, setAmountSelected }: any) => {
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
      className={`h-full relative rounded-[16px] px-2.5 md:px-3.5 pb-2.5 md:pb-3.5 ${
        item.note ? "pt-5 md:pt-6" : "pt-2.5 md:pt-3.5"
      } flex gap-2.5 md:gap-3.5 items-center transition-all duration-300 ${
        isDisabled 
          ? "cursor-not-allowed opacity-50 grayscale-[50%]" 
          : "cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(168,85,247,0.15)]"
      }`}
      style={{
        background: isSelected 
          ? "linear-gradient(145deg, rgba(168,85,247,0.15) 0%, rgba(13,11,26,1) 100%)" 
          : "rgba(13, 11, 26, 0.8)",
        border: isSelected
          ? "1px solid rgba(168,85,247,0.8)"
          : "1px solid rgba(168,85,247,0.15)",
        boxShadow: isSelected 
          ? "0 0 20px rgba(168,85,247,0.25), inset 0 0 15px rgba(168,85,247,0.1)" 
          : "none",
      }}
    >
      {/* Note badge */}
      {item.note && (
        <div
          className="absolute top-0 left-0 px-2 md:px-2.5 py-0.5 md:py-1 text-[8px] md:text-[10px] font-black text-white rounded-br-xl rounded-tl-[15px] uppercase tracking-wider z-10 shadow-sm"
          style={{ background: "linear-gradient(135deg, #7B2FBE, #A855F7)" }}
        >
          {item.note}
        </div>
      )}

      {/* Image Container with Glow */}
      <div className={`relative w-9 h-9 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-purple-500/5 border border-purple-500/10 ${!item.note && "mt-1"}`}>
        {/* Subtle background glow behind the image */}
        <div className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10"></div>
        {item.image ? (
          <Image
            src={getOptimizedUrl(item.image, 128)}
            alt="package image"
            width={32}
            height={32}
            unoptimized={true}
            className="object-contain w-6 h-6 md:w-8 md:h-8 drop-shadow-md z-10"
          />
        ) : (
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-500/20" />
        )}
      </div>

      {/* Info Content */}
      <div className={`flex-1 min-w-0 flex flex-col justify-center ${!item.note && "mt-1"}`}>
        <p className="text-[11px] md:text-[13px] font-medium text-gray-200 line-clamp-2 pr-4 leading-tight">
          {item.amount || `${item.durationDays} Days`}
          {item.slots !== undefined && (
            <span
              className={`text-[10px] font-bold uppercase ml-2 px-1.5 py-0.5 rounded ${
                item.slots > 0 
                  ? "bg-purple-500/20 text-purple-300" 
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {item.slots > 0 ? `${item.slots} Left` : "Out of Stock"}
            </span>
          )}
        </p>
        <p 
          className="font-black text-[14px] md:text-[17px] mt-0.5 tracking-tight"
          style={{
            background: "linear-gradient(to right, #ffffff, #C084FC)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ${item.price}
        </p>
      </div>

      {/* Selected checkmark overlay */}
      {isSelected && (
        <div
          className="absolute top-0 right-0 w-6 h-6 rounded-bl-xl rounded-tr-[15px] flex items-center justify-center shadow-sm z-10"
          style={{ background: "linear-gradient(135deg, #7B2FBE, #A855F7)" }}
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default CostItem;
