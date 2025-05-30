// components/CouponsTable.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

interface Coupon {
  _id: string;
  coupon: string;
  discount: number;
  minAmount: number;
  maxDiscount: number;
  startDate: Date;
  expiry: Date;
  selectedProducts: string[];
  isActive: boolean;
  limit: number;
  timesUsed: number;
  type: string;
}

interface CouponsTableProps {
  coupons: Coupon[];
  products: any[]; // Adjust the type according to your Product model
}

export const CouponsTable: React.FC<CouponsTableProps> = ({
  coupons,
  products,
}) => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/coupons/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/coupon?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete coupon");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting coupon:", error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p._id === productId)?.name || "Unknown Product";
  };

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen bg-gray-900">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <h1 className="text-4xl">Coupons</h1>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/coupons/create")}
        >
          New Coupon
        </Button>
      </Box>
      <TableContainer
        sx={{ backgroundColor: " #1f2937" }}
        className="rounded-xl"
        component={Paper}
      >
        <Table>
          <TableHead className="bg-gray-600">
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Min Amount</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Limit</TableCell>
              <TableCell>Used</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>{coupon.coupon}</TableCell>
                  <TableCell>
                    {coupon.type === "flat"
                      ? `$${coupon.discount}`
                      : `${coupon.discount}%`}
                  </TableCell>
                  <TableCell>${coupon.minAmount}</TableCell>
                  <TableCell>
                    {format(new Date(coupon.startDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(coupon.expiry), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{coupon.limit}</TableCell>
                  <TableCell>{coupon.timesUsed || 0}</TableCell>
                  <TableCell>{coupon.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={coupon.isActive ? "Active" : "Inactive"}
                      color={coupon.isActive ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {getProductName(coupon.selectedProducts.toString())}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(coupon._id)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(coupon._id)}
                      color="error"
                      disabled={isDeleting && deleteId === coupon._id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={coupons.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};
