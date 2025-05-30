"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  CardActionArea,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface Product {
  ID: number;
  post_title: string;
}

interface ApiResponse {
  error: boolean;
  data: {
    Products: Product[];
  };
}

export default function GameListClient({
  initialData,
}: {
  initialData: ApiResponse;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredProducts =
    initialData?.data?.Products.filter((product) =>
      product.post_title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleProductClick = (productId: number) => {
    router.push(`/dashboard/game-list/game-details/${productId}`);
  };

  return (
    <Box sx={{ pl: { md: "280px" }, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Game List
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search games..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3, maxWidth: 600 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredProducts.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item key={product.ID} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  "&:hover": { boxShadow: 6 },
                  backgroundColor: " #1f2937",
                }}
              >
                <CardActionArea onClick={() => handleProductClick(product.ID)}>
                  <CardContent>
                    <Typography variant="h6" component="h2">
                      {product.post_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {product.ID}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          {initialData?.data?.Products.length
            ? "No games found matching your search."
            : "No games available."}
        </Typography>
      )}
    </Box>
  );
}
