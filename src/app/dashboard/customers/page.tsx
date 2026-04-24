"use client";

import Customers from "@/components/Dashboard/Customers";
import { CircularProgress, Box } from "@mui/material";
import { useCustomers } from "@/hooks/useCustomers";

export default function CustomersPage() {
  const { data: customers = [], isLoading, isError } = useCustomers();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        className="md:pl-72 bg-gray-900"
      >
        <CircularProgress sx={{ color: "#f68181" }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <div className="md:pl-72 px-4 py-6 text-white bg-gray-900 min-h-screen">
        Failed to load customers. Please try again later.
      </div>
    );
  }

  return <Customers allCustomers={customers} />;
}
