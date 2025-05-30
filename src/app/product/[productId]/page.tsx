"use client";
import { useEffect, useState } from "react";
import Product from "@/components/Product";
import Loader from "@/components/Loader";

export default function Page({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/product?id=${params.productId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const productData = await response.json();
        setProduct(productData);
      } catch (err: any) {
        setError(
          err.message || "An error occurred while fetching the product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.productId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <h1>Product Not Found</h1>
        <p>
          We couldn&apos;t find the product you&apos;re looking for. Please
          check the ID.
        </p>
      </div>
    );
  }

  return <Product {...product} />;
}
