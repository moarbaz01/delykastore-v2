import { unstable_cache } from "next/cache";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/database";
import { Product } from "@/models/product.model";
import { authOptions } from "@/utils/authOptions";

export type HomeProductType = "topup" | "account" | "digital-service";

export interface HomeProduct {
  _id: string;
  name: string;
  image: string;
  stock: boolean;
  type: HomeProductType;
  isLink?: boolean;
  link?: string;
}

// Cards only need these fields; skipping the large `cost` array keeps the
// payload small
const CARD_FIELDS = "name image stock type isLink link";

const queryProducts = async (
  type: HomeProductType,
  includeTesting: boolean,
): Promise<HomeProduct[]> => {
  await dbConnect();

  const filter: Record<string, unknown> = {
    isDeleted: false,
    ...(type === "topup"
      ? { $or: [{ type: "topup" }, { type: { $exists: false } }] }
      : { type }),
  };
  if (!includeTesting) filter.isTesting = { $ne: true };

  const products = await Product.find(filter).select(CARD_FIELDS).lean();
  return products.map((p: any) => ({
    _id: p._id.toString(),
    name: p.name,
    image: p.image,
    stock: p.stock,
    type: p.type ?? "topup",
    isLink: p.isLink,
    link: p.link,
  }));
};

// Public listing is the same for every visitor, so cache it for a minute
// instead of hitting MongoDB on every page view
const getPublicProducts = unstable_cache(
  (type: HomeProductType) => queryProducts(type, false),
  ["home-products"],
  { revalidate: 60, tags: ["products"] },
);

export const getHomeProducts = async (
  type: HomeProductType,
): Promise<HomeProduct[]> => {
  const session = await getServerSession(authOptions);
  // Admins also see test products, so they skip the shared cache
  if (session?.user?.role === "admin") return queryProducts(type, true);
  return getPublicProducts(type);
};
