import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAccounts = (productId?: string, costId?: string) => {
  return useQuery({
    queryKey: ["accounts", { productId, costId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productId && productId !== "all")
        params.append("productId", productId);
      if (costId && costId !== "all") params.append("costId", costId);
      const res = await axios.get(
        `/api/accounts${params.toString() ? "?" + params.toString() : ""}`
      );
      return res.data;
    },
  });
};

export const useUpsertAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: any }) => {
      if (id) {
        const res = await axios.put(`/api/accounts?id=${id}`, data);
        return res.data;
      } else {
        const res = await axios.post("/api/accounts", data);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/accounts?id=${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};
