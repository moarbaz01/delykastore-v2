"use client";
import Image from "next/image";

const GiftBox = ({
  onClick,
  disabled = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) => {
  // const pathname = usePathname();
  // if (pathname.startsWith("/dashboard") || pathname.startsWith("/product"))
  //   return null;
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`h-[80px] cursor-pointer z-[50] w-[80px] aspect-square rounded-full fixed bottom-20 md:bottom-10 right-2 
                 hover:scale-110 transition-all duration-300 ease-in-out
                 hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] ${disabled
          ? 'opacity-50 cursor-not-allowed grayscale'
          : 'animate-bounce hover:animate-pulse'
        }`}
    >
      <Image
        width={120}
        height={120}
        alt="logo"
        className="h-full w-full rounded-full"
        src="/images/gift.png"
      />
    </div>
  );
};

export default GiftBox;
