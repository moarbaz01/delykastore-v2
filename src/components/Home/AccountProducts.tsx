import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { dbConnect } from "@/lib/database";
import { Product } from "@/models/product.model";
import { unstable_noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { MdOutlineAccountCircle } from "react-icons/md";

const AccountProducts = async () => {
  unstable_noStore();
  await dbConnect();
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";
  
  const filter: any = {
    type: "account",
    isDeleted: false,
  };
  
  if (!isAdmin) {
    filter.isTesting = { $ne: true };
  }

  const products = await Product.find(filter).lean();

  if (products.length === 0) return null;

  return (
    <section className="mx-4 md:mx-auto max-w-7xl mt-8 mb-6">
      <div
        className="rounded-2xl md:p-6"

      >
        <SectionHeader
          title="PREMIUM ACCOUNTS"
          icon={<MdOutlineAccountCircle size={16} />}
        />

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map((item) => (
            <GameCard
              key={item._id.toString()}
              _id={item._id.toString()}
              name={item.name}
              image={item.image}
              stock={item.stock}
              type="account"
              isLink={item.isLink}
              link={item.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccountProducts;
