"use client";

import Categories from "@/components/Dashboard/Categories";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get("/api/categories");
      return response.data;
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

  return <Categories categories={categories} />;
}
