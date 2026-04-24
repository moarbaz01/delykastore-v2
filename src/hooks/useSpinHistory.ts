import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useSpinHistory = (queryString: string) => {
  return useQuery({
    queryKey: ["spin-history", queryString],
    queryFn: async () => {
      const res = await axios.get(`/api/spin/history?${queryString}`);
      return res.data;
    },
  });
};

export const useUpdateSpinStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      spinId,
      status,
    }: {
      spinId: string;
      status: string;
    }) => {
      const res = await axios.put("/api/spin/update-status", {
        spinId,
        status,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["spin-history"] });
    },
    onError: (error) => {
      toast.error("Failed to update status");
      console.error("Error updating spin status:", error);
    },
  });
};
