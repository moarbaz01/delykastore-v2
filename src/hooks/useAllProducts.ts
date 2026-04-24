import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useAllProducts = () => {
  return useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const response = await axios.get("/api/product");
      return response.data;
    },
  });
};
