import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface ProfileOrder {
  _id: string;
  status: "success" | "failed" | "pending";
  amount: number;
  transactionId?: string;
  createdAt: string;
  expiresAt?: string;
  productId?: string;
  product?: {
    _id: string;
    name: string;
    image: string;
    type: "account" | "direct" | "gift";
  };
  gameCredentials?: {
    userId: string;
    zoneId?: string;
  };
  accountDetails?: {
    email: string;
    password?: string;
  };
  playerId?: string;
}

export interface ProfileOrdersResponse {
  orders: ProfileOrder[];
  pagination: {
    page: number;
    totalPages: number;
    totalOrders: number;
    limit: number;
  };
}

export const useProfileOrders = (page: number, status: string, search: string) => {
  return useQuery<ProfileOrdersResponse>({
    queryKey: ["profile-orders", { page, status, search }],
    queryFn: async () => {
      const res = await axios.get(
        `/api/profile/orders?page=${page}&status=${status}&search=${search}`
      );
      return res.data;
    },
  });
};
