"use client";

import OrderLogs from "@/components/Dashboard/OrderLogs";
import Loader from "@/components/Loader";
import { useOrderLogs } from "@/hooks/useOrderLogs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderLogsWrapper() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const { data, isLoading } = useOrderLogs(queryString);

  return (
    <OrderLogs
      logs={data?.logs || []}
      total={data?.total || 0}
      isLoading={isLoading}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <OrderLogsWrapper />
    </Suspense>
  );
}
