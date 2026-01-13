import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useUserWagering = (
  userId?: string,
  zoneId?: string,
  serverId?: string,
  email?: string,
) => {
  return useQuery({
    queryKey: ["userWagering", userId, zoneId, serverId, email],
    queryFn: async () => {
      // Build query params based on what's available
      const params: any = {};
      if (userId) params.userId = userId;
      if (zoneId) params.zoneId = zoneId;
      if (serverId) params.serverId = serverId;
      if (email) params.email = email;

      // At least one identifier is required
      if (Object.keys(params).length === 0) {
        throw new Error("At least one user identifier is required");
      }

      const res = await axios.get("/api/user/wagering", { params });
      return res.data; // Should return { monthlyWagering: number }
    },
    enabled: !!(userId || zoneId || serverId || email), // Enable if any identifier exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
