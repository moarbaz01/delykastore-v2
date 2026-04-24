"use client";

import OrderView from "@/components/Dashboard/Orders/OrderView";
import Loader from "@/components/Loader";
import { useOrder } from "@/hooks/useOrders";

export default function Page({ params }: { params: { orderId: string } }) {
  const { data: order, isLoading, error } = useOrder(params.orderId);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl">
          <h1 className="text-xl font-bold text-red-400 mb-2">Error</h1>
          <p className="text-red-300">Failed to load order data. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-400">
        Order not found.
      </div>
    );
  }

  return <OrderView order={order} />;
}
