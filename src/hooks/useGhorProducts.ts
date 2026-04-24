import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGhorProducts = () => {
  return useQuery({
    queryKey: ["ghor-products"],
    queryFn: async () => {
      const response = await axios.get("/api/unipin/fetch-products");
      return response.data.data[0];
    },
  });
};
