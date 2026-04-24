"use client";

import { CouponsTable } from "@/components/Dashboard/Coupon/CouponsTable";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

const CouponsPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["couponsAndProducts"],
    queryFn: async () => {
      const [couponsRes, productsRes] = await Promise.all([
        axios.get("/api/coupon"),
        axios.get("/api/products"),
      ]);
      return {
        coupons: couponsRes.data.coupons || [],
        products: productsRes.data || [],
      };
    },
  });

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
      <div className="md:pl-72 px-4 py-6 text-white bg-gray-900 min-h-screen">
        Failed to load coupons. Please try again later.
      </div>
    );
  }

  return (
    <div>
      <CouponsTable
        coupons={data?.coupons || []}
        products={data?.products || []}
      />
    </div>
  );
};

export default CouponsPage;
