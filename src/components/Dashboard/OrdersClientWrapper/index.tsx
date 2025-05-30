"use client";
import Orders from "@/components/Dashboard/Orders";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // Pass all query parameters to the API
      const queryString = searchParams.toString();
      const res = await axios.get(`/api/order/query?${queryString}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(res.data);
      setOrders(res.data.orders);
      setTotalOrders(res.data.total);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchParams]);

  return (
      <Orders
        allOrders={orders}
        totalOrders={totalOrders}
        isLoading={isLoading}
      />
  );
};

export default OrdersPage;
