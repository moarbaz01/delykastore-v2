import { dbConnect } from "@/lib/database";
import { Product } from "@/models/product.model";
import { unstable_noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { Metadata } from "next";
import GamesClient from "./GamesClient";

export const metadata: Metadata = {
  title: "All Games | DELYKASTORE",
  description: "Browse all games and top-up services on DELYKASTORE.",
};

export default async function GamesPage() {
  unstable_noStore();
  await dbConnect();
  
  // Fetch only non-deleted products that are type "topup" (or missing type)
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";
  
  const filter: any = {
    $or: [{ type: "topup" }, { type: { $exists: false } }],
    isDeleted: false,
  };
  
  if (!isAdmin) {
    filter.isTesting = { $ne: true };
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  // Convert ObjectIds to strings so they can be serialized to the client
  const serializedProducts = products.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    image: p.image,
    stock: p.stock,
    type: p.type,
    isLink: p.isLink,
    link: p.link,
  }));

  return <GamesClient products={serializedProducts as any} />;
}
