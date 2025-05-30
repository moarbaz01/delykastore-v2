import { CouponsTable } from "@/components/Dashboard/Coupon/CouponsTable";
import { dbConnect } from "@/lib/database";
import { Coupon } from "@/models/coupon.model";
import { Product } from "@/models/product.model";
import { unstable_noStore } from "next/cache";

const CouponsPage = async () => {
  unstable_noStore();
  await dbConnect();
  const [coupons, products] = await Promise.all([
    Coupon.find({}).sort({ createdAt: -1 }).lean(),
    Product.find({ isDeleted: false }).lean(),
  ]);

  return (
    <div>
      <CouponsTable
        coupons={JSON.parse(JSON.stringify(coupons))}
        products={JSON.parse(JSON.stringify(products))}
      />
    </div>
  );
};

export default CouponsPage;
