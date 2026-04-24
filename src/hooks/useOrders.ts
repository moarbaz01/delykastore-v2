import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useOrders = (queryString: string) => {
  return useQuery({
    queryKey: ["orders", queryString],
    queryFn: async () => {
      const response = await axios.get(`/api/order/query?${queryString}`);
      return response.data;
    },
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await axios.get(`/api/order?id=${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await axios.put(`/api/order?id=${id}`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
    onError: (error) => {
      toast.error("Failed to update order status");
      console.error("Update status error:", error);
    },
  });
};
