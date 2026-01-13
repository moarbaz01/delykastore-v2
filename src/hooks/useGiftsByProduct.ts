import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Gift {
  _id: string;
  productId: {
    _id: string;
    name: string;
  };
  bannerText?: string;
  wagering?: number[];
  startDate?: string;
  endDate?: string;
  costIds?: string[];
  costs?: Array<{
    amount: string;
    price: number;
  }>;
  features?: Array<{
    title: string;
    value: string;
  }>;
  isActive: boolean;
}

// Fetch gifts by product ID
export const useGiftsByProduct = (productId?: string) => {
  return useQuery({
    queryKey: ["gifts", "product", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");
      const res = await axios.get(`/api/gifts?productId=${productId}`);
      return res.data as Gift[];
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
