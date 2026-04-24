"use client";
import Products from "@/components/Dashboard/Products";
import Loader from "@/components/Loader";
import { useAllProducts } from "@/hooks/useAllProducts";
import { useGhorProducts } from "@/hooks/useGhorProducts";
import { useProductsList } from "@/hooks/useProductsList";

const Page = () => {
  const {
    data: allProducts,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useAllProducts();
  const {
    data: ghorProductsList,
    isLoading: isLoadingGhor,
    error: errorGhor,
  } = useGhorProducts();
  const {
    data: productsList,
    isLoading: isLoadingList,
    error: errorList,
  } = useProductsList();

  const loading = isLoadingAll; // Only wait for the main products list
  const error = errorAll;

  if (loading) {
    return <Loader />;
  }

  if (error || !allProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading products. Please try again later.
      </div>
    );
  }

  return (
    <Products
      ghorProductlist={ghorProductsList || []}
      allProducts={allProducts}
      productsList={productsList || []}
    />
  );
};

export default Page;
