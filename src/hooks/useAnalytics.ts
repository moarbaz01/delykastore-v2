import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface AnalyticsData {
  orders: number | null;
  products: number | null;
  customers: number | null;
  revenue: number | null;
  todaysIncome: number | null;
  monthlyIncome: number | null;
  weeklySales: Array<{ _id: string; total: number; count: number }>;
  monthlySales: Array<{ _id: string; total: number; count: number }>;
  orderStatusCounts: Array<{ _id: string; count: number }> | null;
  topProducts: Array<{
    _id: string;
    totalSales: number;
    count: number;
    productDetails: {
      name: string;
      price: string;
    };
  }>;
}

export const useAnalytics = () => {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await axios.get("/api/analytics");
      return response.data;
    },
  });
};
