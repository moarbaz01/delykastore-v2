import Image, { StaticImageData } from "next/image";
import Link from "next/link";

interface GameCardProps {
  _id: string;
  name: string;
  image: StaticImageData | string;
  stock?: boolean;
  type: "account" | "topup";
  isLink?: boolean;
  link?: string;
  price?: string;
  originalPrice?: string;
  discount?: string;
}

import { Reveal } from "./Reveal";

const GameCard = ({
  _id,
  name,
  image,
  stock,
  type,
  isLink,
  link,
  price,
  originalPrice,
  discount,
}: GameCardProps) => {
  const href = isLink && link ? link : `/product/${_id}`;
  const isExternal =
    isLink && link && (link.startsWith("http") || link.startsWith("https"));

  // Mocking values if not provided to match the exact aesthetic in the design
  const displayPrice = price || "3.99";
  const displayOriginalPrice = originalPrice || "4.99";
  const displayDiscount = discount || "-20%";

  return (
    <Reveal width="100%">
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="group block"
      >
        <div
          className={`relative rounded-2xl overflow-hidden transition-all duration-300 bg-[#161430] hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:-translate-y-1 ${
            !stock ? "opacity-60" : ""
          }`}
        >
          {/* Image Area */}
          <div className="relative w-full aspect-square overflow-hidden">
            <Image
              src={image}
              alt={name}
              priority={true}
              fill
              className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
                !stock ? "grayscale" : ""
              }`}
            />
            {/* Out of stock overlay */}
            {!stock && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
                <span className="text-[10px] md:text-xs font-bold text-red-400 bg-black/80 px-2 py-1 rounded-full border border-red-500/30">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Info at the bottom */}
          <div className="p-3 flex flex-col justify-end h-full">
            <p className="text-sm font-bold text-white leading-tight truncate mb-2">
              {name}
            </p>
            <div className="flex items-center w-full mt-auto">
              <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-primary rounded-lg text-[10px] md:text-xs font-bold text-white shadow-sm shadow-purple-500/20 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all">
                Top Up
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
};

export default GameCard;
