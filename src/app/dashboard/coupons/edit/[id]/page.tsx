// app/admin/coupons/edit/[id]/page.tsx
import { CouponForm } from "@/components/Dashboard/Coupon/CouponForm";
import { dbConnect } from "@/lib/database";
import { Coupon } from "@/models/coupon.model";
import { Product } from "@/models/product.model";

const EditCouponPage = async ({ params }: { params: { id: string } }) => {
  await dbConnect();
  const coupon = await Coupon.findById(params.id).lean();
  const products = await Product.find({}).lean();

  if (!coupon) {
    return <div>Coupon not found</div>;
  }

  return (
    <div>
      <CouponForm
        products={JSON.parse(JSON.stringify(products))}
        initialData={JSON.parse(JSON.stringify(coupon))}
        isEdit
        couponId={params.id}
      />
    </div>
  );
};

export default EditCouponPage;
