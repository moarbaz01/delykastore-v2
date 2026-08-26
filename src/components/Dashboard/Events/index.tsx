"use client";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";
import { Trash2 as DeleteIcon, Plus as Add } from "lucide-react";

const Events = ({ allProducts, events, refreshEvents }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCost, setSelectedCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductChange = (e: SelectChangeEvent) => {
    setSelectedProduct(e.target.value);
    setSelectedCost(""); // Reset cost when product changes
  };

  const handleAddEvent = async () => {
    if (!selectedProduct || !selectedCost) {
      toast.error("Please select a product and a cost item.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post("/api/events", {
        productId: selectedProduct,
        costId: selectedCost,
      });
      if (res.data.success) {
        toast.success("Event added successfully");
        setIsModalOpen(false);
        setSelectedProduct("");
        setSelectedCost("");
        refreshEvents();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await axios.delete(`/api/events/${id}`);
      if (res.data.success) {
        toast.success("Event deleted");
        refreshEvents();
      }
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const selectedProductData = allProducts.find((p: any) => p._id === selectedProduct);

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-6">Events</h1>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: "#A855F7", color: "white", "&:hover": { bgcolor: "#9333EA" } }}
        >
          Add New Event
        </Button>
      </div>

      {/* Events Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Cost ID</TableCell>
              <TableCell>Cost Details</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.length > 0 ? (
              events.map((event: any) => {
                const product = event.productId;
                const cost = product?.cost?.find((c: any) => c.id === event.costId);
                
                return (
                  <TableRow key={event._id}>
                    <TableCell>
                      <Image
                        src={cost?.image || product?.image || "/placeholder.jpg"}
                        alt={product?.name || "Product"}
                        className="object-cover rounded-md bg-gray-700"
                        width={50}
                        height={50}
                      />
                    </TableCell>
                    <TableCell>{product?.name || "Unknown Product"}</TableCell>
                    <TableCell>{event.costId}</TableCell>
                    <TableCell>
                      {cost ? (
                        <div className="flex flex-col text-sm">
                          <span className="font-bold text-green-500">{cost.price}</span>
                          {cost.amount && <span className="text-xs text-gray-400">Amount: {cost.amount}</span>}
                          {cost.note && <span className="text-xs text-gray-400">Note: {cost.note}</span>}
                        </div>
                      ) : (
                        <span className="text-red-400">Cost not found</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDelete(event._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No events found. Click &quot;Add New Event&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Event Dialog (MUI) */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: "#1e293b", color: "white" }}>Add New Event</DialogTitle>
        <DialogContent sx={{ bgcolor: "#1e293b", pt: 3 }}>
          <div className="space-y-6 mt-2">
            <FormControl fullWidth>
              <InputLabel id="product-select-label" sx={{ color: "gray" }}>Select Product</InputLabel>
              <Select
                labelId="product-select-label"
                value={selectedProduct}
                onChange={handleProductChange}
                label="Select Product"
                sx={{ color: "white", ".MuiOutlinedInput-notchedOutline": { borderColor: "gray" } }}
              >
                {allProducts.map((p: any) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name} ({p.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!selectedProduct}>
              <InputLabel id="cost-select-label" sx={{ color: "gray" }}>Select Cost Item</InputLabel>
              <Select
                labelId="cost-select-label"
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                label="Select Cost Item"
                sx={{ color: "white", ".MuiOutlinedInput-notchedOutline": { borderColor: "gray" } }}
              >
                {selectedProductData?.cost?.map((c: any) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.price} - {c.amount || c.note || "No specific amount"} ({c.category})
                  </MenuItem>
                ))}
              </Select>
              {selectedProductData && (!selectedProductData.cost || selectedProductData.cost.length === 0) && (
                <p className="text-xs text-red-400 mt-2">This product has no cost items.</p>
              )}
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#1e293b", p: 2 }}>
          <Button onClick={() => setIsModalOpen(false)} sx={{ color: "gray" }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddEvent} 
            disabled={isSubmitting || !selectedProduct || !selectedCost}
            variant="contained"
            sx={{ bgcolor: "#A855F7", color: "white", "&:hover": { bgcolor: "#9333EA" } }}
          >
            {isSubmitting ? "Adding..." : "Add Event"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Events;
