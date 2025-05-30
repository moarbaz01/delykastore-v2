"use client";

import { useEffect, useState } from "react";
import OrderView from "@/components/Dashboard/Orders/OrderView";
import Loader from "@/components/Loader";

export default function Page({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/order?id=${params.orderId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`,
            },
            cache: "no-store", // Ensure fresh data is fetched every time
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch order: ${res.statusText}`);
        }

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId]); // Re-fetch if orderId changes

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  return <OrderView order={order} />;
}
