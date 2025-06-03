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
      <BackgroundGradient className="text-white hover:opacity-80 transition bg-black  h-auto p-3 shadow-sm  rounded-3xl ">
        <div className="flex items-center flex-col">
          <div className="md:h-auto h-[100px] aspect-square">
            <Image
              src={image}
              alt={name}
              priority={true}
              height={150}
              width={150}
             
              className={`rounded-xl w-full h-auto aspect-square object-cover ${
                !stock ? "grayscale" : ""
              }`}
            />
          </div>
          <div className=" h-[45px] mt-2 text-center  flex items-center font-extrabold stroke-black stroke-2 text-[12px] sm:text-xl ">
            {name}
          </div>
          <div className=" flex items-center justify-center w-full ">
            <button className="bg-red-500 md:w-2/3  w-full text-nowrap flex items-center justify-center translate-y-5  text-white md:py-1 py-[2px] px-5 md:px-6 text-sm sm:text-base rounded-full hover:bg-slate-700 transition-colors">
              {stock ? "Top - Up" : "Out of Stock"}
            </button>
          </div>
        </div>
      </BackgroundGradient>
    </Link>
  );
};

export default GameComponent;
