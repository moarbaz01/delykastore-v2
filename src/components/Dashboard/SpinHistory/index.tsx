"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  SelectChangeEvent,
  Chip,
  Button,
} from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useUpdateSpinStatus } from "@/hooks/useSpinHistory";

interface SpinRecord {
  _id: string;
  transactionId: string;
  prize: string;
  status: string;
  createdAt: string;
  product?: {
    name: string;
  };
  user?: {
    email: string;
  };
  gameCredentials?: {
    userId: string;
    zoneId: string;
  };
  amount: number;
}

interface SpinHistoryProps {
  allSpins: SpinRecord[];
  totalSpins: number;
  isLoading: boolean;
  onStatusUpdate: () => void;
}

const renderSkeletonRows = (rowCount: number = 10) => {
  return Array.from({ length: rowCount }).map((_, index) => (
    <TableRow key={index} className="py-4">
      {Array.from({ length: 9 }).map((_, cellIndex) => (
        <TableCell key={cellIndex}>
          <Skeleton height={40} baseColor="#3f3f46" highlightColor="#52525b" />
        </TableCell>
      ))}
    </TableRow>
  ));
};

const SpinHistory: React.FC<SpinHistoryProps> = ({
  allSpins,
  totalSpins,
  isLoading,
  onStatusUpdate,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1") - 1;
  const rowsPerPage = parseInt(searchParams.get("limit") || "10");

  const [monthFilter, setMonthFilter] = useState(
    searchParams.get("month") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const updateMutation = useUpdateSpinStatus();

  const updateStatus = async (spinId: string, newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ spinId, status: newStatus });
      onStatusUpdate();
    } catch (error) {
      // toast is handled in mutation
    }
  };

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (monthFilter) params.set("month", monthFilter);
    else params.delete("month");

    if (statusFilter) params.set("status", statusFilter);
    else params.delete("status");

    if (dateFilter) params.set("date", dateFilter);
    else params.delete("date");

    if (search) params.set("search", search);
    else params.delete("search");

    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthFilter, statusFilter, dateFilter, search]);

  const handleChangePage = (event: unknown, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (newPage + 1).toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newRowsPerPage.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="md:ml-72 md:py-6 md:px-6 px-4 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white mb-6">Spin Reward History</h1>
        <p className="text-2xl font-bold text-white mb-6">
          Total: {totalSpins || 0}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <FormControl size="small" className="w-64">
          <InputLabel shrink>Filter by Month</InputLabel>
          <Select
            value={monthFilter}
            onChange={(e: SelectChangeEvent<string>) =>
              setMonthFilter(e.target.value)
            }
            label="Filter by Month"
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          size="small"
          label="Search by Transaction ID"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "300px" }}
        />

        <FormControl size="small" className="w-64">
          <InputLabel shrink>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e: SelectChangeEvent<string>) =>
              setStatusFilter(e.target.value)
            }
            label="Filter by Status"
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="reject">Reject</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>

        <TextField
          variant="outlined"
          size="small"
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-64"
          InputLabelProps={{ shrink: true }}
        />
      </div>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalSpins}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Prize Won</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Zone ID</TableCell>
              <TableCell>Order Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? renderSkeletonRows(rowsPerPage)
              : allSpins?.map((spin) => (
                  <TableRow key={spin._id} hover>
                    <TableCell>{spin.transactionId}</TableCell>
                    <TableCell>
                      <span className={spin.prize === "Better Luck" ? "text-red-400" : "text-green-400"}>
                        {spin.prize}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={spin.status}
                        color={
                          spin.status === "success"
                            ? "success"
                            : spin.status === "pending"
                            ? "warning"
                            : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>{spin.product?.name || "N/A"}</TableCell>
                    <TableCell>{spin.gameCredentials?.userId || "N/A"}</TableCell>
                    <TableCell>{spin.gameCredentials?.zoneId || "N/A"}</TableCell>
                    <TableCell>${spin.amount}</TableCell>
                    <TableCell>
                      {new Date(spin.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={spin.status === "success" || updateMutation.isPending}
                          onClick={() => updateStatus(spin._id, "success")}
                        >
                          {updateMutation.isPending && updateMutation.variables?.spinId === spin._id ? "..." : "Success"}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          disabled={spin.status === "pending" || updateMutation.isPending}
                          onClick={() => updateStatus(spin._id, "pending")}
                        >
                          {updateMutation.isPending && updateMutation.variables?.spinId === spin._id ? "..." : "Pending"}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          disabled={spin.status === "reject" || updateMutation.isPending}
                          onClick={() => updateStatus(spin._id, "reject")}
                        >
                          {updateMutation.isPending && updateMutation.variables?.spinId === spin._id ? "..." : "Reject"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SpinHistory;