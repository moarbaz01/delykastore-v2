import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { BackgroundGradient } from "../ui/BackgroundGradient";

const GameComponent = ({
  _id,
  name,
  image,
  stock,
}: {
  _id: string;
  name: string;
  image: StaticImageData | string;
  stock?: boolean;
}) => {
  return (
    <Link href={`/product/${_id}`}>
      <div className="text-white hover:opacity-80 transition bg-gradient-to-b from-primary/40 via-primary/20 to-secondary  h-auto p-3  rounded-lg overflow-hidden">
        <div className="flex   flex-col">
          <div className="w-full h-[80%]">
            <Image
              src={image}
              alt={name}
              priority={true}
              height={150}
              width={150}
              className={`rounded-lg md:w-full h-auto aspect-square object-cover ${
                !stock ? "grayscale" : ""
              }`}
            />
          </div>
          <div className="mt-2 h-[20%]  font-bold text-sm">{name}</div>
          <button className="mt-2 w-full bg-primary text-black font-bold py-2 rounded-lg">
            Top Up
          </button>
        </div>
      </div>
    </Link>
  );
};

export default GameComponent;
