"use client";
import Gifts from "@/components/Dashboard/Gifts";
import { useGifts, useProducts, useDeleteGift } from "@/hooks/useGifts";
import Loader from "@/components/Loader";

const GiftsClientWrapper = () => {
  const { data: gifts = [], isLoading: isLoadingGifts } = useGifts();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const deleteMutation = useDeleteGift();

  const handleDeleteGift = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  if (isLoadingGifts || isLoadingProducts) {
    return <Loader />;
  }

  return (
    <Gifts
      gifts={gifts}
      products={products}
      isLoading={isLoadingGifts || isLoadingProducts}
      onDeleteGift={handleDeleteGift}
      // Note: onCreateGift and onUpdateGift are handled via navigation in the Gifts component
      onCreateGift={() => {}}
      onUpdateGift={() => {}}
    />
  );
};

export default GiftsClientWrapper;
