"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Divider,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  createdAt: string;
  product: { name: string };
  status: string;
  orderType: string;
  gameCredentials: {
    zoneId: string;
    userId: string;
    game: string;
  };
  failureReason: string;
  amount: string;
  orderDetails: string;
  couponCode: string;
  couponDetails: {
    code: string;
    type: string;
    discountValue: number;
    maxDiscount: number;
    minAmount: number;
  };
}

const OrderView = ({ order }: { order: Order }) => {
  const [status, setStatus] = useState(order.status);
  const loadingRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const handleStatusUpdate = async () => {
    if (status === order.status) {
      toast.error("Status is already up to date");
      return;
    }
    try {
      loadingRef.current = toast.loading("Updating status...");
      setIsUpdating(true);
      await axios.put(`/api/order?id=${order._id}`, {
        status,
      });
      toast.success("Status updated successfully");
    } catch (error) {
      console.log("Error updating status:", error);
      toast.error("Error updating status");
    } finally {
      toast.dismiss(loadingRef.current);
      setIsUpdating(false);
    }
  };

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen  ">
      <Typography variant="h4" className="text-white mb-6">
        Order Details
      </Typography>

      <Box
        sx={{
          flex: 1,
          backgroundColor: "#2D3748",
          padding: "16px",
          borderRadius: "8px",
          maxWidth: "600px",
        }}
      >
        <Typography variant="h6" className="text-white mb-4">
          Order Information
        </Typography>
        <Divider sx={{ backgroundColor: "#4A5568", marginBottom: "16px" }} />

        {/* Simplified Order Details */}
        <Box component="div" className="bg-gray-800 p-4">
          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Order ID:
            </Typography>
            <Typography variant="body1">{order?._id}</Typography>
          </Box>

          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Product:
            </Typography>
            <Typography variant="body1">
              {order?.product?.name || "Fack Order"}
            </Typography>
          </Box>

          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Status:
            </Typography>
            <Typography variant="body1">{status}</Typography>
          </Box>

          {order?.failureReason && (
            <Box sx={{ marginBottom: "10px" }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Failure Reason:
              </Typography>
              <Typography variant="body1">{order?.failureReason}</Typography>
            </Box>
          )}
          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Price:
            </Typography>
            <Typography variant="body1">${order?.amount}</Typography>
          </Box>

          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Coupom Applied:
            </Typography>
            <Typography variant="body1">
              {order?.couponCode ? order?.couponCode : "No coupom applied"}{" "}
            </Typography>
          </Box>

          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Discount:
            </Typography>
            <Typography variant="body1">
              {order?.couponDetails?.discountValue
                ? `${order?.couponDetails?.type === "flat" ? "$" : ""}${
                    order?.couponDetails?.discountValue
                  }
                  ${order?.couponDetails?.type === "percentage" ? "%" : ""} 
                  `
                : "No discount applied"}
            </Typography>
          </Box>

          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Coupon Type:
            </Typography>
            <Typography variant="body1">
              {order?.couponDetails?.type
                ? `${order?.couponDetails?.type}`
                : "No discount applied"}
            </Typography>
          </Box>

          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Date:
            </Typography>
            <Typography variant="body1">
              {new Date(order?.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Status Update Section */}
      <Box
        component="div"
        className="
      bg-gray-800
      flex-1
      p-4
      mt-6
      rounded-md
      flex flex-col gap-2
      w-fit
      "
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginBottom: "16px" }}
        >
          Update Status
        </Typography>
        <Select
          value={status}
          disabled={order?.status === "success"}
          onChange={handleStatusChange}
          sx={{
            backgroundColor: "#E2E8F0",
            color: "#2D3748",
            "&.Mui-disabled": {
              backgroundColor: "rgba(0, 0, 0, 0.12)", // Light gray background when disabled
              color: "rgba(0, 0, 0, 0.38)", // Dimmed text color
              cursor: "not-allowed",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 0, 0, 0.23)", // Border color when disabled
            },
          }}
        >
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="success">Success</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </Select>
        <Button
          onClick={handleStatusUpdate}
          disabled={isUpdating}
          sx={{
            marginTop: "16px",
            backgroundColor: "#4A5568",
            color: "white",
            "&:hover": {
              backgroundColor: "#2D3748",
            },
          }}
        >
          Update Status
        </Button>
      </Box>
    </div>
  );
};

export default OrderView;
