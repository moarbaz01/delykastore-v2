import { dbConnect } from "@/lib/database";
import { Product } from "@/models/product.model";
import { unstable_noStore } from "next/cache";
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
  const products = await Product.find({
    $or: [{ type: "topup" }, { type: { $exists: false } }],
    isDeleted: false,
  }).lean();

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
