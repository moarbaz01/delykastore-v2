import { CreateGiftData, Gift, UpdateGiftData } from "@/types/main";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export interface Product {
  _id: string;
  name: string;
  cost: Array<{
    id: string;
    amount: string;
    price: string;
    note?: string;
    image?: string;
    category?: string;
  }>;
}

// Fetch products
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get("/api/products");
      return res.data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch gift by ID
export const useGift = (giftId?: string) => {
  return useQuery({
    queryKey: ["gift", giftId],
    queryFn: async () => {
      if (!giftId) throw new Error("Gift ID is required");
      const res = await axios.get(`/api/gifts?id=${giftId}`);
      return res.data as Gift;
    },
    enabled: !!giftId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create gift mutation
export const useCreateGift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGiftData) => {
      const res = await axios.post("/api/gifts", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Gift created successfully");
      queryClient.invalidateQueries({ queryKey: ["gifts"] });
    },
    onError: (error) => {
      toast.error("Failed to create gift");
      console.error("Failed to create gift:", error);
    },
  });
};

// Update gift mutation
export const useUpdateGift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      giftId,
      data,
    }: {
      giftId: string;
      data: UpdateGiftData;
    }) => {
      return axios.put(`/api/gifts?id=${giftId}`, data);
    },
    onSuccess: (_, { giftId }) => {
      toast.success("Gift updated successfully");
      queryClient.invalidateQueries({ queryKey: ["gifts"] });
      queryClient.invalidateQueries({ queryKey: ["gift", giftId] });
    },
    onError: (error) => {
      toast.error("Failed to update gift");
      console.error("Failed to update gift:", error);
    },
  });
};
