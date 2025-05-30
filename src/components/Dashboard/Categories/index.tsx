"use client"; // Mark the component as a Client Component

import { Button, Paper, TextField } from "@mui/material";
import { Delete, Edit, Plus } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { revalidatePath } from "next/cache";

interface Category {
  _id: string;
  name: string;
}

export default function Categories({
  categories: initialCategories,
}: {
  categories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("/api/categories", {
        name: newCategoryName,
      });
      const newCategory = response.data;
      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName(""); // Clear the input field
      toast.success("Category added successfully.");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category.");
    }
  };

  // Update a category
  const handleUpdateCategory = async (id: string, newName: string) => {
    if (!newName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      await axios.put(`/api/categories?id=${id}`, { name: newName });
      setCategories((prev) =>
        prev.map((cat) => (cat._id === id ? { ...cat, name: newName } : cat))
      );
      toast.success("Category updated successfully.");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category.");
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id: string) => {
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
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen bg-gray-900">
      <h1 className="text-2xl font-bold text-white mb-6">Manage Categories</h1>
      <Paper
        className="p-6"
        style={{ backgroundColor: "#374151", color: "#D1D5DB" }}
      >
        {/* Add New Category */}
        <div className="mb-4 md:flex items-center flex-row gap-4">
          <TextField
            fullWidth
            label="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
          />
          <Button
            onClick={handleAddCategory}
            color="primary"
            variant="contained"
            className="mt-2"
          >
            <Plus /> Add
          </Button>
        </div>

        {/* List of Categories */}
        {categories.map((category) => (
          <div
            key={category._id}
            className="mb-4 md:flex items-center flex-row gap-4"
          >
            <TextField
              fullWidth
              label="Category Name"
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
              margin="normal"
              variant="outlined"
              sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
            />
            <Button
              onClick={() => handleUpdateCategory(category._id, category.name)}
              color="secondary"
              variant="contained"
              className="mt-2"
            >
              <Edit />
            </Button>
            <Button
              onClick={() => handleDeleteCategory(category._id)}
              color="secondary"
              variant="contained"
              className="mt-2"
            >
              <Delete />
            </Button>
          </div>
        ))}
      </Paper>
    </div>
  );
}
