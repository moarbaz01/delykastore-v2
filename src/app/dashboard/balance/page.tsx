"use client";

import Balance from "@/components/Dashboard/Balance";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

export default function BalancePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      const response = await axios.get("/api/balance");
      return response.data;
    },
  });

  console.log("data", data);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        className="md:pl-72 bg-gray-900"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <div className="md:pl-72 px-4 bg-gray-900 min-h-screen flex items-center justify-center text-white">
        Error fetching balance
      </div>
    );
  }

  return (
    <Balance smileOneBalance={data?.smileOneBalance} ghorBalance={data?.ghorBalance} />
  );
} 
