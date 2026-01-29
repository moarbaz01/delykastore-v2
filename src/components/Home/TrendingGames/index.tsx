import GameComponent from "@/components/GameComponent";
import { dbConnect } from "@/lib/database";
import { Product } from "@/models/product.model";
import { unstable_noStore } from "next/cache";
import { IoLogoGameControllerB } from "react-icons/io";

const TrendingGames = async () => {
  unstable_noStore();
  await dbConnect();
  const products = await Product.find().lean();

  return (
    <div className=" mx-4 md:mx-auto max-w-7xl mt-8 mb-6">
      <div className="w-full bg-secondary border border-gray-600 p-4 rounded-lg ">
        <div className=" font-extrabold flex items-center gap-2 text-xl">
          <IoLogoGameControllerB className="text-2xl" />
          <span>GAME TOPUP</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-3  items-center justify-center lg:grid-cols-4 md:gap-6 gap-4 mt-4">
          {products.length > 0 ? (
            products.map((item) => (
              <GameComponent
                key={item._id.toString()}
                _id={item._id.toString()}
                name={item.name}
                image={item.image}
                stock={item.stock}
              />
            ))
          ) : (
            <p className="text-white col-span-full text-center">
              No games found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingGames;
