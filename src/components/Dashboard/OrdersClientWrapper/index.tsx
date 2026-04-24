"use client";
import Orders from "@/components/Dashboard/Orders";
import { useOrders } from "@/hooks/useOrders";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const { data, isLoading, error } = useOrders(queryString);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch orders");
      console.error("Failed to fetch orders:", error);
    }
  }, [error]);

  return (
    <Orders
      allOrders={data?.orders || []}
      totalOrders={data?.total || 0}
      isLoading={isLoading}
    />
  );
};

export default OrdersPage;
