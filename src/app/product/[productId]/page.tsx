"use client";
import { useProduct } from "@/hooks/useProduct";
import Product from "@/components/Product";
import ProductSkeleton from "@/components/Product/ProductSkeleton";

export default function Page({ params }: { params: { productId: string } }) {
  const { data: product, isLoading, error } = useProduct(params.productId);
  console.log("product", product);
  if (isLoading) {
    // return <Loader />;
    return <ProductSkeleton />;
  }

  if (error) {
    return (
      <div>
        <h1>កំហុស</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <h1>រកមិនឃើញផលិតផល</h1>
        <p>យើងរកមិនឃើញផលិតផលដែលអ្នកកំពុងស្វែងរក។ សូមពិនិត្យ ID។</p>
      </div>
    );
  }

  return <Product {...product} />;
}
