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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add,
  Close,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import axios from "axios";
import { randomHexColor } from "@/utils/hex";

interface Prize {
  _id: string;
  name: string;
  color: string;
  winRate: number;
  weight: number;
  limit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productId?: {
    _id: string;
    name: string;
  };
}

const Prizes = ({ allPrizes, id }: { allPrizes: Prize[]; id: string }) => {
  const [prizes, setPrizes] = useState<Prize[]>(allPrizes);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: randomHexColor(),
    winRate: 10,
    weight: 10,
    limit: 1,
    productId: id,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredPrizes = prizes.filter((prize) => {
    const matchesSearch = prize.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (prize: Prize) => {
    setEditingPrize(prize);
    setFormData({
      name: prize.name,
      color: prize.color,
      winRate: prize.winRate,
      weight: prize.weight,
      limit: prize.limit,
      productId: id,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prize?")) {
      return toast.error("Prize not deleted");
    }

    try {
      const response = await axios.delete(`/api/prizes/${id}`);
      if (response.status === 200) {
        toast.success("Prize deleted successfully");
        setPrizes(prizes.filter((prize) => prize._id !== id));
      } else {
        toast.error("Failed to delete prize");
      }
    } catch (error) {
      console.error("Error deleting prize:", error);
      toast.error("Error deleting prize");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPrize
        ? `/api/prizes/${editingPrize._id}`
        : "/api/prizes";
      const method = editingPrize ? "put" : "post";

      const response = await axios[method](url, formData);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          `Prize ${editingPrize ? "updated" : "created"} successfully`
        );

        if (editingPrize) {
          setPrizes(
            prizes.map((prize) =>
              prize._id === editingPrize._id ? response.data : prize
            )
          );
        } else {
          setPrizes([...prizes, response.data]);
        }

        handleCloseDialog();
      } else {
        toast.error(`Failed to ${editingPrize ? "update" : "create"} prize`);
      }
    } catch (error) {
      console.error("Error saving prize:", error);
      toast.error(`Error ${editingPrize ? "updating" : "creating"} prize`);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPrize(null);
    setFormData({
      name: "",
      color: randomHexColor(),
      winRate: 10,
      weight: 10,
      limit: 1,
      productId: id,
    });
  };

  const handleAddNew = () => {
    setEditingPrize(null);
    setFormData({
      name: "",
      color: randomHexColor(),
      winRate: 10,
      weight: 10,
      limit: 1,
      productId: id,
    });
    setOpenDialog(true);
  };

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen bg-gray-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white mb-6">Prizes</h1>
        <p className="text-2xl font-bold text-white mb-6">
          Total : {prizes?.length || 0}
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <TextField
          fullWidth
          label="Search by Name"
          variant="outlined"
          value={search}
          onChange={handleSearch}
          sx={{
            color: "#E5E7EB",
            backgroundColor: "#374151",
            borderRadius: "10px",
          }}
        />
      </div>

      <div className="mb-6">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
          sx={{
            backgroundColor: "#3B82F6",
            "&:hover": {
              backgroundColor: "#2563EB",
            },
          }}
        >
          Add New Prize
        </Button>
      </div>

      {/* Prizes Table */}
      <TableContainer className="bg-gray-800 rounded-xl">
        <Table>
          <TableHead className="bg-gray-600">
            <TableRow>
              <TableCell style={{ color: "#E5E7EB" }}>Name</TableCell>
              <TableCell style={{ color: "#E5E7EB" }}>Color</TableCell>
              <TableCell style={{ color: "#E5E7EB" }}>Win Rate</TableCell>
              <TableCell style={{ color: "#E5E7EB" }}>Weight</TableCell>
              <TableCell style={{ color: "#E5E7EB" }}>Limit</TableCell>
              <TableCell style={{ color: "#E5E7EB" }}>Status</TableCell>
              <TableCell style={{ color: "#E5E7EB" }}>Created</TableCell>
              <TableCell style={{ color: "#E5E7EB" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrizes.length > 0 ? (
              filteredPrizes.map((prize) => (
                <TableRow key={prize._id}>
                  <TableCell sx={{ color: "#D1D5DB" }}>{prize.name}</TableCell>
                  <TableCell>
                    <Box className="flex items-center gap-2">
                      <Box
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: prize.color }}
                      />
                      <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                        {prize.color}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#D1D5DB" }}>
                    {prize.winRate}%
                  </TableCell>
                  <TableCell sx={{ color: "#D1D5DB" }}>
                    {prize.weight}
                  </TableCell>
                  <TableCell sx={{ color: "#D1D5DB" }}>{prize.limit}</TableCell>
                  <TableCell>
                    <Chip
                      label={prize.isActive ? "Active" : "Inactive"}
                      color={prize.isActive ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#D1D5DB" }}>
                    {new Date(prize.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(prize)}
                      sx={{ color: "#60A5FA" }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(prize._id)}
                      sx={{ color: "#EF4444" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Typography sx={{ color: "#9CA3AF" }}>
                    No prizes found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="bg-gray-800">
          {editingPrize ? "Edit Prize" : "Add New Prize"}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: "absolute", right: 8, top: 8, color: "#9CA3AF" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="bg-gray-800">
            <Box className="space-y-4 pt-4">
              <TextField
                fullWidth
                label="Prize Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#4B5563",
                    },
                    "&:hover fieldset": {
                      borderColor: "#6B7280",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#9CA3AF",
                  },
                  "& .MuiInputBase-input": {
                    color: "#E5E7EB",
                  },
                }}
              />

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#9CA3AF", mb: 1 }}
                >
                  Color
                </Typography>
                <TextField
                  fullWidth
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "48px",
                    },
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Win Rate (%)"
                type="number"
                value={formData.winRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    winRate: parseInt(e.target.value),
                  })
                }
                required
                inputProps={{ min: 0, max: 100 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#4B5563",
                    },
                    "&:hover fieldset": {
                      borderColor: "#6B7280",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#9CA3AF",
                  },
                  "& .MuiInputBase-input": {
                    color: "#E5E7EB",
                  },
                }}
              />

              <TextField
                fullWidth
                label="Weight"
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: parseInt(e.target.value),
                  })
                }
                required
                inputProps={{ min: 0, max: 100 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#4B5563",
                    },
                    "&:hover fieldset": {
                      borderColor: "#6B7280",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#9CA3AF",
                  },
                  "& .MuiInputBase-input": {
                    color: "#E5E7EB",
                  },
                }}
              />

              <TextField
                fullWidth
                label="Limit"
                type="number"
                value={formData.limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limit: parseInt(e.target.value),
                  })
                }
                required
                inputProps={{ min: 0 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#4B5563",
                    },
                    "&:hover fieldset": {
                      borderColor: "#6B7280",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#9CA3AF",
                  },
                  "& .MuiInputBase-input": {
                    color: "#E5E7EB",
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions className="bg-gray-800 p-4">
            <Button onClick={handleCloseDialog} sx={{ color: "#9CA3AF" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#3B82F6",
                "&:hover": {
                  backgroundColor: "#2563EB",
                },
              }}
            >
              {editingPrize ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default Prizes;
