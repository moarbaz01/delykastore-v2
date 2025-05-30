import Categories from "@/components/Dashboard/Categories";
import { dbConnect } from "@/lib/database";
import { CostCategory } from "@/models/costcategory.model";
import { unstable_noStore } from "next/cache";

export default async function CategoriesPage() {
  unstable_noStore();
  await dbConnect();
  const categories = await CostCategory.find().lean();

  return (
    <Categories categories={JSON.parse(JSON.stringify(categories)) || []} />
  );
}
