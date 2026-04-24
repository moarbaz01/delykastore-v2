import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useProductsList = () => {
  return useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      const response = await axios.get("/api/productslist");
      return response.data.data;
    },
  });
};
