"use client"; // Mark the component as a Client Component

import {
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Delete, Edit, Plus } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  type?: "topup" | "account";
}

export default function Categories({
  categories: initialCategories,
}: {
  categories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"topup" | "account">("topup");

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("/api/categories", {
        name: newCategoryName,
        type: newCategoryType,
      });
      const newCategory = response.data;
      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName(""); // Clear the input field
      setNewCategoryType("topup");
      toast.success("Category added successfully.");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category.");
    }
  };

  // Update a category
  const handleUpdateCategory = async (id: string, newName: string, newType: string) => {
    if (!newName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      await axios.put(`/api/categories?id=${id}`, { name: newName, type: newType });
      setCategories((prev) =>
        prev.map((cat) => (cat._id === id ? { ...cat, name: newName, type: newType as "topup" | "account" } : cat))
      );
      toast.success("Category updated successfully.");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category.");
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await axios.delete(`/api/categories?id=${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      toast.success("Category deleted successfully.");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Manage Categories</h1>
      <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
        <h2 className="text-xl font-semibold mb-4 text-white">Add New Category</h2>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <TextField
            fullWidth
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            size="small"

          />
          <Select
            fullWidth
            value={newCategoryType}
            onChange={(e) => setNewCategoryType(e.target.value as "topup" | "account")}
            size="small"
          >
            <MenuItem value="topup">Top-Up</MenuItem>
            <MenuItem value="account">Premium Account</MenuItem>
          </Select>
          <Button
            onClick={handleAddCategory}
            color="primary"
            variant="contained"
            className="w-full md:w-auto h-10 min-w-[120px]"
          >
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
      </Paper>

      <TableContainer>
        <Table aria-label="categories table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Category Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell sx={{ width: 200 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No categories found. Create one above!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id} hover>
                  <TableCell>
                    <TextField
                      fullWidth
                      value={category.name}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((cat) =>
                            cat._id === category._id
                              ? { ...cat, name: e.target.value }
                              : cat
                          )
                        )
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      fullWidth
                      value={category.type || "topup"}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((cat) =>
                            cat._id === category._id
                              ? { ...cat, type: e.target.value as "topup" | "account" }
                              : cat
                          )
                        )
                      }
                      size="small"
                    >
                      <MenuItem value="topup">Top-Up</MenuItem>
                      <MenuItem value="account">Premium Account</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleUpdateCategory(category._id, category.name, category.type || "topup")}
                        color="primary"
                        variant="contained"
                        size="small"
                        title="Save Changes"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category._id)}
                        color="error"
                        variant="contained"
                        size="small"
                        title="Delete Category"
                      >
                        <Delete className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
