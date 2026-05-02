"use client";
import Products from "@/components/Dashboard/Products";
import Loader from "@/components/Loader";
import { useAllProducts } from "@/hooks/useAllProducts";
import { useProductsList } from "@/hooks/useProductsList";

const Page = () => {
  const {
    data: allProducts,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useAllProducts();

  const {
    data: productsList,
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
      allProducts={allProducts}
      brProductsList={productsList?.br || []}
      phProductsList={productsList?.ph || []}
    />
  );
};

export default Page;
