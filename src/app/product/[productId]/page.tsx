"use client";
import { useProduct } from "@/hooks/useProduct";
import Product from "@/components/Product";
import ProductSkeleton from "@/components/Product/ProductSkeleton";

export default function Page({ params }: { params: { productId: string } }) {
  const { data: product, isLoading, error } = useProduct(params.productId);

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-gray-400">We couldn&apos;t find the product you&apos;re looking for.</p>
        </div>
      </div>
    );
  }

  return <Product {...product} />;
}


