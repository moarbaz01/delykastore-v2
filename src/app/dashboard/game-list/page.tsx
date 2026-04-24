"use client";

import GameListClient from "@/components/Dashboard/GameList";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

export default function GameList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["game-list"],
    queryFn: async () => {
      const response = await axios.get("/api/game-list");
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

  if (isError) {
    return (
      <div className="md:pl-72 py-4 px-4 bg-gray-900 min-h-screen text-white">
        <h1>Game List</h1>
        <pre>Failed to load game list.</pre>
      </div>
    );
  }

  return <GameListClient initialData={data} />;
}
