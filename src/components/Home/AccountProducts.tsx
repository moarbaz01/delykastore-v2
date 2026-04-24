import GameComponent from "@/components/GameComponent";
import { dbConnect } from "@/lib/database";
import { Product } from "@/models/product.model";
import { unstable_noStore } from "next/cache";
import { MdOutlineAccountCircle } from "react-icons/md";

const AccountProducts = async () => {
  unstable_noStore();
  await dbConnect();
  const products = await Product.find({ type: "account", isDeleted: false }).lean();

  if (products.length === 0) return null;

  return (
    <div className=" mx-4 md:mx-auto max-w-7xl mt-8 mb-6">
      <div className="w-full bg-secondary border border-gray-600 p-4 rounded-lg ">
        <div className=" font-extrabold flex items-center gap-2 text-xl">
          <MdOutlineAccountCircle className="text-2xl" />
          <span>PREMIUM ACCOUNTS</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-3  items-center justify-center lg:grid-cols-4 md:gap-6 gap-4 mt-4">
          {products.map((item) => (
            <GameComponent
              key={item._id.toString()}
              _id={item._id.toString()}
              name={item.name}
              image={item.image}
              stock={item.stock}
              type="account"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountProducts;
