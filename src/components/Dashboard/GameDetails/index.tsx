"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import Image from "next/image";

interface Variation {
  variation_name: string;
  variation_id: number;
  variation_price: number;
}

interface ProductDetails {
  Product_Name: string;
  Image_URL: string;
  Variation: Variation[];
}

export default function GameDetails({
  productDetails,
}: {
  productDetails: ProductDetails;
}) {
  return (
    <div className="md:pl-72 px-4 py-4">
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "fixed", backgroundColor: " #1f2937" }}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 200,
                  height: 200,
                  mb: 2,
                  "& img": {
                    objectFit: "contain",
                  },
                }}
              >
                <Image
                  src={productDetails[0].Image_URL as string}
                  alt={productDetails[0].Product_Name}
                  width={200}
                  height={200}
                />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                {productDetails[0].Product_Name}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ backgroundColor: " #1f2937" }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Available Packages
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                {productDetails[0].Variation.map((variation) => (
                  <ListItem
                    key={variation.variation_id}
                    secondaryAction={
                      <Chip
                        label={`$${variation.variation_price}`}
                        color="primary"
                      />
                    }
                  >
                    <ListItemText
                      primary={variation.variation_name}
                      secondary={`ID: ${variation.variation_id}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
