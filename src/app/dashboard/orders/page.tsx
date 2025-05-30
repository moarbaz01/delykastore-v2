import { Suspense } from "react";
import OrdersClientWrapper from "@/components/Dashboard/OrdersClientWrapper";
import Loader from "@/components/Loader";

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loader />}>
      <OrdersClientWrapper />
    </Suspense>
  );
}
