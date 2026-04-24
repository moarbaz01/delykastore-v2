import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useGiftTransactions = (queryString: string) => {
  return useQuery({
    queryKey: ["gift-transactions", queryString],
    queryFn: async () => {
      const res = await axios.get(`/api/gift-transaction?${queryString}`);
      return res.data;
    },
  });
};

export const useUpdateGiftTransactionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axios.put("/api/gift-transaction", { id, status });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Transaction status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["gift-transactions"] });
    },
    onError: (error) => {
      toast.error("Failed to update transaction status");
      console.error("Error updating transaction status:", error);
    },
  });
};
