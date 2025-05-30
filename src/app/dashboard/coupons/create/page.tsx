// app/admin/coupons/create/page.tsx
import { CouponForm } from "@/components/Dashboard/Coupon/CouponForm";
import { dbConnect } from "@/lib/database";
import { Product } from "@/models/product.model";

const CreateCouponPage = async () => {
  await dbConnect();
  const products = await Product.find({}).lean();

  return (
    <div>
      <CouponForm products={JSON.parse(JSON.stringify(products))} />
    </div>
  );
};

export default CreateCouponPage;
