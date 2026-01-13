"use client";
import SpinHistory from "@/components/Dashboard/SpinHistory";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const SpinHistoryClientWrapper = () => {
  const [spins, setSpins] = useState([]);
  const [totalSpins, setTotalSpins] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const fetchSpinHistory = async () => {
    try {
      setIsLoading(true);
      const queryString = searchParams.toString();
      const res = await axios.get(`/api/spin/history?${queryString}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setSpins(res.data.spins);
      setTotalSpins(res.data.total);
    } catch (error) {
      toast.error("Failed to fetch spin history");
      console.error("Failed to fetch spin history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpinHistory();
  }, [searchParams]);

  return (
    <SpinHistory
      allSpins={spins}
      totalSpins={totalSpins}
      isLoading={isLoading}
      onStatusUpdate={fetchSpinHistory}
    />
  );
};

export default SpinHistoryClientWrapper;
