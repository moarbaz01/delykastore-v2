"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/Dashboard/ProductForm";
import Loader from "@/components/Loader";

export default function Page({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/product?id=${params.productId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store", // Disables caching to ensure fresh data
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch product data: ${res.statusText}`);
        }

        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.log(err);
        setError("Failed to load product data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.productId]); // Depend on productId to re-fetch when it changes

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
    return <div>Product not found.</div>;
  }

  return <ProductForm product={product} />;
}
