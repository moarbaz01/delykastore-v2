"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Button,
} from "@mui/material";
import { CheckCircle2, XCircle, Download } from "lucide-react";

interface AluuGame {
  Name: string;
  gamecode: string;
  image: string;
  totalProducts: number;
}

interface AluuProduct {
  _id: string;
  name: string;
  gamecode: string;
  Pack: string;
  price: number;
  stockStatus: string;
  requiresUserId: boolean;
  requiresServerId: boolean;
  requiresCharName: boolean;
}

export default function AluuPackagesClient() {
  const [selectedGameCode, setSelectedGameCode] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch games list
  const {
    data: gamesData,
    isLoading: isGamesLoading,
    isError: isGamesError,
  } = useQuery({
    queryKey: ["aluu-games"],
    queryFn: async () => {
      const response = await axios.get("/api/aluu/games");
      return response.data?.data as AluuGame[];
    },
  });

  // Fetch products for selected game
  const {
    data: productsData,
    isLoading: isProductsLoading,
  } = useQuery({
    queryKey: ["aluu-products", selectedGameCode],
    queryFn: async () => {
      if (!selectedGameCode) return [];
      const response = await axios.get(`/api/aluu/products?gameCode=${selectedGameCode}`);
      return response.data?.data as AluuProduct[];
    },
    enabled: !!selectedGameCode,
  });

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedProducts = productsData
    ? [...productsData].sort((a, b) => {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      })
    : [];

  const handleExportCSV = () => {
    if (!sortedProducts.length) return;

    // Standard headers for DelykaStore Product Cost importing
    const headers = ["id", "amount", "price", "durationDays", "category", "note", "image"];
    
    const rows = sortedProducts.map((p) => {
      // Map ALUU fields to standard fields
      return [
        p.Pack, // id
        `"${p.name.replace(/"/g, '""')}"`, // amount (quote to escape commas)
        p.price, // price
        "", // durationDays
        "no_category", // category
        "", // note
        "" // image
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedGameCode}_packages.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ pl: { md: "280px" }, p: 4, minHeight: "100vh", color: "white" }}>
      <Typography variant="h4" component="h1" gutterBottom className="font-bold">
        ALUU API Packages
      </Typography>
      <Typography variant="body1" className="text-gray-400 mb-8 max-w-2xl">
        View live packages directly from the ALUU API. Select a game to see all available denominations, pricing, and stock status.
      </Typography>

      <Card sx={{ bgcolor: "#1f2937", mb: 4, borderColor: "#374151", borderWidth: 1, borderStyle: "solid" }}>
        <CardContent>
          {isGamesError ? (
            <Typography color="error">Failed to load games from ALUU API. Check your API key.</Typography>
          ) : (
            <FormControl fullWidth variant="outlined">
              <InputLabel id="game-select-label" sx={{ color: "gray" }}>Select a Game</InputLabel>
              <Select
                labelId="game-select-label"
                value={selectedGameCode}
                onChange={(e) => setSelectedGameCode(e.target.value)}
                label="Select a Game"
                sx={{
                  color: "white",
                  ".MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9ca3af" },
                  ".MuiSvgIcon-root": { color: "white" },
                }}
              >
                {isGamesLoading ? (
                  <MenuItem disabled>Loading games...</MenuItem>
                ) : (
                  gamesData?.map((game) => (
                    <MenuItem key={game.gamecode} value={game.gamecode}>
                      <div className="flex items-center gap-3">
                        {game.Name}
                        <span className="text-xs text-gray-500">({game.gamecode})</span>
                      </div>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
        </CardContent>
      </Card>

      {selectedGameCode && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h6" className="text-gray-200">
              Available Packages for {gamesData?.find((g) => g.gamecode === selectedGameCode)?.Name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Download size={18} />}
              onClick={handleExportCSV}
              disabled={isProductsLoading || sortedProducts.length === 0}
              sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
            >
              Export CSV
            </Button>
          </Box>

          {isProductsLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={40} />
            </Box>
          ) : sortedProducts.length === 0 ? (
            <Typography className="text-gray-400">No packages available for this game.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: "#1f2937", border: "1px solid #374151" }}>
              <Table sx={{ minWidth: 650 }} aria-label="aluu packages table">
                <TableHead>
                  <TableRow sx={{ "& th": { borderBottom: "1px solid #374151", color: "gray", fontWeight: "bold" } }}>
                    <TableCell>Package Name</TableCell>
                    <TableCell>Cost ID (Denom)</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={true}
                        direction={sortOrder}
                        onClick={handleSort}
                        sx={{
                          color: "white !important",
                          "& .MuiTableSortLabel-icon": { color: "white !important" },
                        }}
                      >
                        Price
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Stock Status</TableCell>
                    <TableCell>Required Fields</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedProducts.map((product) => (
                    <TableRow
                      key={product._id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 }, "& td": { borderBottom: "1px solid #374151", color: "white" } }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-purple-400 font-bold">{product.Pack}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-green-400 font-bold">{product.price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.stockStatus === "in_stock" ? "In Stock" : "Out of Stock"}
                          size="small"
                          color={product.stockStatus === "in_stock" ? "success" : "error"}
                          sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <div className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded ${product.requiresUserId ? 'bg-blue-900/40 text-blue-300' : 'text-gray-600'}`}>
                            {product.requiresUserId ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} User ID
                          </div>
                          <div className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded ${product.requiresServerId ? 'bg-blue-900/40 text-blue-300' : 'text-gray-600'}`}>
                            {product.requiresServerId ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} Server ID
                          </div>
                          <div className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded ${product.requiresCharName ? 'bg-blue-900/40 text-blue-300' : 'text-gray-600'}`}>
                            {product.requiresCharName ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} Char Name
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}
