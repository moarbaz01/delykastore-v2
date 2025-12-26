import { decryptData } from "@/utils/encryption";
import { useQuery } from "@tanstack/react-query";

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product?id=${productId}&grouped=true`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
      const data = await response.json();
      const product = decryptData(data.product);
      return product;
    },
    enabled: !!productId,
  });
};
