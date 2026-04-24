"use client";
import GiftTransactions from "@/components/Dashboard/GiftTransactions";
import { useGiftTransactions } from "@/hooks/useGiftTransactions";
import { useSearchParams } from "next/navigation";

const GiftTransactionsPage = () => {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const { data, isLoading } = useGiftTransactions(queryString);

  return (
    <GiftTransactions
      allTransactions={data?.transactions || []}
      totalTransactions={data?.pagination?.total || 0}
      isLoading={isLoading}
    />
  );
};

export default GiftTransactionsPage;
