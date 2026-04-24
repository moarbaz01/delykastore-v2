import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useSliders = () => {
  return useQuery({
    queryKey: ["sliders"],
    queryFn: async () => {
      const response = await axios.get("/api/sliders");
      return response.data.sliders;
    },
  });
};

export const useUpdateSlider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, slider }: { id: string; slider: any }) => {
      const response = await axios.put(`/api/sliders/?id=${id}`, slider);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
  });
};
