"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Plus as Add,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FallbackImage from "@/components/ui/FallbackImage";
import toast from "react-hot-toast";
import axios from "axios";
import { FaGift } from "react-icons/fa";

const Products = ({ allProducts, brProductsList, phProductsList }) => {
  const router = useRouter();
  const [products, setProducts] = useState(allProducts);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/products/product/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return toast.error("Product not deleted");
    }
    const endpoint = `/api/product?id=${id}`;

    // Api Request
    try {
      const response = await axios.delete(endpoint);
      if (response.status === 200) {
        toast.success("Product deleted successfully");
        setProducts(products.filter((product) => product._id !== id));
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete product");
    }
  };

  const handleSpins = (id: string) => {
    router.push(`/dashboard/products/spin/${id}`);
  };

  // Filter products based on search input and type filter
  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(search.toLowerCase()) ||
        product._id.includes(search)) &&
      (typeFilter === "all" || product.type === typeFilter),
  );

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white mb-6">Products</h1>
        <p className="text-2xl font-bold text-white mb-6">
          Total : {products?.length || 0}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <TextField
          fullWidth
          label="Search by Name or ID"
          variant="outlined"
          value={search}
          onChange={handleSearch}
          sx={{ flex: 2 }}
        />
        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel shrink>Filter by Type</InputLabel>
          <Select
            value={typeFilter}
            label="Filter by Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="topup">Top-Up</MenuItem>
            <MenuItem value="account">Premium Account</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => router.push("/dashboard/products/product")}
          variant="contained"
          startIcon={<Add />}
        >
          Add New Product
        </Button>
      </div>

      {/* Products Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <FallbackImage
                      src={product.image}
                      alt={product.name}
                      className="object-cover rounded-md"
                      width={50}
                      height={50}
                      fallbackIconSize={24}
                    />
                  </TableCell>
                  <TableCell>{product._id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {product.type || "topup"}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={product.description} arrow>
                      <span className="cursor-help">
                        {product.description?.length > 30
                          ? `${product.description.substring(0, 30)}...`
                          : product.description}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleSpins(product._id)}
                      color="warning"
                    >
                      <FaGift />
                    </IconButton>
                    <IconButton
                      onClick={() => handleEdit(product._id)}
                      color="info"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(product._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex mt-6  gap-8">
        <div className="">
          <h1 className="text-primary font-bold mb-2 text-xl">
            Philippines Products List
          </h1>
          <ul className="flex flex-col gap-4">
            {phProductsList?.map((product, index) => (
              <li
                key={product.id || index}
                className="p-4 border border-gray-700 rounded-md"
              >
                <p>
                  <span className="font-bold text-gray-400">Region:</span>{" "}
                  {product.region?.toUpperCase()}
                </p>
                <p>
                  <span className="font-bold text-gray-400">ID:</span>{" "}
                  {product.id || product.productid}
                </p>
                <p>
                  <span className="font-bold text-gray-400">Name (SPU):</span>{" "}
                  {product.spu || product.name}
                </p>
                <p>
                  <span className="font-bold text-gray-400">Price:</span>{" "}
                  {product.price || product.amount}
                </p>
                {product.cost_price && (
                  <p>
                    <span className="font-bold text-gray-400">Cost Price:</span>{" "}
                    {product.cost_price}
                  </p>
                )}
                {product.discount && (
                  <p>
                    <span className="font-bold text-gray-400">Discount:</span>{" "}
                    {product.discount}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="">
          <h1 className="text-primary font-bold mb-2 text-xl">
            Brazil Product List
          </h1>
          <ul className="flex flex-col gap-4">
            {brProductsList?.map((product, index) => (
              <li
                key={product.id || index}
                className="p-4 border border-gray-700 rounded-md"
              >
                <p>
                  <span className="font-bold text-gray-400">ID:</span>{" "}
                  {product.id || product.productid}
                </p>
                <p>
                  <span className="font-bold text-gray-400">Name (SPU):</span>{" "}
                  {product.spu || product.name}
                </p>
                <p>
                  <span className="font-bold text-gray-400">Price:</span>{" "}
                  {product.price || product.amount}
                </p>
                {product.cost_price && (
                  <p>
                    <span className="font-bold text-gray-400">Cost Price:</span>{" "}
                    {product.cost_price}
                  </p>
                )}
                {product.discount && (
                  <p>
                    <span className="font-bold text-gray-400">Discount:</span>{" "}
                    {product.discount}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Products;
