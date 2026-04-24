"use client";
import SpinHistory from "@/components/Dashboard/SpinHistory";
import { useSpinHistory } from "@/hooks/useSpinHistory";
import { useSearchParams } from "next/navigation";

const SpinHistoryClientWrapper = () => {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const { data, isLoading, refetch } = useSpinHistory(queryString);

  return (
    <SpinHistory
      allSpins={data?.spins || []}
      totalSpins={data?.total || 0}
      isLoading={isLoading}
      onStatusUpdate={refetch}
    />
  );
};

export default SpinHistoryClientWrapper;
