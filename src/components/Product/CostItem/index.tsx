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
      className={`relative rounded-[16px] p-2 md:p-3 flex flex-col items-center text-center transition-all duration-300 group ${
        isDisabled
          ? "opacity-50 cursor-not-allowed pointer-events-none grayscale-[50%]"
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
      {/* Selected Checkmark (Top Right) */}
      {isSelected && (
        <div 
          className="absolute top-0 right-0 w-6 h-6 md:w-7 md:h-7 rounded-bl-xl rounded-tr-[15px] flex items-center justify-center shadow-sm z-10"
          style={{ background: "linear-gradient(135deg, #7B2FBE, #A855F7)" }}
        >
          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Note badge */}
      {item.note && (
        <div
          className="absolute top-0 left-0 px-2 py-0.5 text-[8px] md:text-[9px] font-black text-white rounded-br-xl rounded-tl-[15px] uppercase tracking-wider z-10 shadow-sm"
          style={{ background: "linear-gradient(135deg, #7B2FBE, #A855F7)" }}
        >
          {item.note}
        </div>
      )}

      {/* Image Container with Glow */}
      <div className={`relative w-12 h-12 md:w-16 md:h-16 mb-2 flex items-center justify-center rounded-xl bg-purple-500/5 border border-purple-500/10 ${item.note ? "mt-4 md:mt-3" : "mt-2"}`}>
        <div className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10"></div>
        {item.image ? (
          <Image
            src={getOptimizedUrl(item.image, 128)}
            alt="package image"
            width={64}
            height={64}
            unoptimized={true}
            className={`object-contain w-8 h-8 md:w-10 md:h-10 drop-shadow-md z-10 transition-transform duration-300 group-hover:scale-110`}
          />
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-500/20" />
        )}
      </div>

      {/* Info Content */}
      <div className="flex-1 w-full flex flex-col justify-center items-center">
        <p className="text-[10px] md:text-[12px] font-medium text-gray-200 leading-tight mb-1.5 line-clamp-2 px-1">
          {item.amount || `${item.durationDays} Days`}
        </p>

        {/* Stock */}
        {item.slots !== undefined && item.slots === 0 && (
          <span className="text-[8px] md:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mb-1.5 bg-red-500/20 text-red-400">
            Out of Stock
          </span>
        )}
        
        <div 
          className="mt-auto w-full max-w-[100%] rounded-full py-1 text-[11px] md:text-[13px] font-black tracking-wide transition-all border flex justify-center items-center group-hover:bg-primary group-hover:border-transparent group-hover:shadow-[0_0_10px_rgba(168,85,247,0.4)] group-hover:text-white"
          style={{
            background: isSelected ? "linear-gradient(135deg, #7B2FBE, #A855F7)" : "rgba(168,85,247,0.1)",
            borderColor: isSelected ? "transparent" : "rgba(168,85,247,0.3)",
            color: isSelected ? "white" : "#C084FC",
            boxShadow: isSelected ? "0 0 10px rgba(168,85,247,0.4)" : "none"
          }}
        >
          ${item.price}
        </div>
      </div>
    </div>
  );
};

export default CostItem;
