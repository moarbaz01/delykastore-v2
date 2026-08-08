import { dbConnect } from "@/lib/database";
import { Product } from "@/models/product.model";
import { unstable_noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import ExploreTabs from "../ExploreTabs";

const TrendingGames = async () => {
  unstable_noStore();
  await dbConnect();
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";
  
  const filter: any = {
    isDeleted: false,
  };
  
  if (!isAdmin) {
    filter.isTesting = { $ne: true };
  }

  const products = await Product.find(filter).lean();
  
  // Serialize products for the client component
  const serializedProducts = products.map(p => ({
    _id: p._id.toString(),
    name: p.name,
    image: p.image,
    stock: p.stock,
    type: p.type,
    isLink: p.isLink,
    link: p.link,
  }));

  return <ExploreTabs products={serializedProducts as any} />;
};

export default TrendingGames;
