import { decryptData } from "@/utils/encryption";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/product?id=${productId}&grouped=true`,
      );

      const product = decryptData(data.product);
      return product;
    },
    enabled: !!productId,
  });
};
