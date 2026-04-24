import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface OrderLogData {
  _id: string;
  transactionId?: string;
  orderId?: any;
  provider: string;
  requestPayload?: any;
  responsePayload?: any;
  status: "success" | "failed" | "pending";
  errorMessage?: string;
  createdAt: string;
}

export const useOrderLogs = (queryString: string) => {
  return useQuery({
    queryKey: ["order-logs", queryString],
    queryFn: async () => {
      const response = await axios.get(`/api/order-logs?${queryString}`);
      return response.data as {
        logs: OrderLogData[];
        total: number;
        page: number;
        totalPages: number;
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
};
