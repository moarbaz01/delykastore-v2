"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import { Visibility, Close } from "@mui/icons-material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { OrderLogData } from "@/hooks/useOrderLogs";

interface OrderLogsProps {
  logs: OrderLogData[];
  total: number;
  isLoading: boolean;
}

const renderSkeletonRows = (rowCount: number = 10) => {
  return Array.from({ length: rowCount }).map((_, index) => (
    <TableRow key={index} className="py-4">
      {Array.from({ length: 8 }).map((_, cellIndex) => (
        <TableCell key={cellIndex}>
          <Skeleton height={40} baseColor="#3f3f46" highlightColor="#52525b" />
        </TableCell>
      ))}
    </TableRow>
  ));
};

const OrderLogs: React.FC<OrderLogsProps> = ({ logs, total, isLoading }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1") - 1;
  const rowsPerPage = parseInt(searchParams.get("limit") || "25");

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );

  const [selectedLog, setSelectedLog] = useState<OrderLogData | null>(null);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

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
        <h1 className="text-2xl font-bold text-white mb-6">API Order Logs</h1>
        <p className="text-xl font-bold text-gray-400 mb-6">Total: {total}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <TextField
          size="small"
          label="Search by Trans ID / Provider"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateFilters("search", search);
          }}
          onBlur={() => updateFilters("search", search)}
          sx={{ width: "300px" }}
        />
        <FormControl size="small" className="w-64">
          <InputLabel shrink>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              updateFilters("status", e.target.value);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Table */}
      <TableContainer>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Request Payload</TableCell>
              <TableCell>Response Payload</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Error Message</TableCell>
              <TableCell sx={{ textAlign: "right" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? renderSkeletonRows(rowsPerPage)
              : logs?.map((log) => (
                  <TableRow key={log._id} hover>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {log.provider}
                    </TableCell>
                    <TableCell>{log.transactionId || "N/A"}</TableCell>
                    <TableCell sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "help" }}>
                      <Tooltip 
                        title={<Box component="pre" sx={{ fontSize: '0.75rem', p: 1 }}>{JSON.stringify(log.requestPayload, null, 2)}</Box>} 
                        arrow 
                        placement="top"
                      >
                        <span>{JSON.stringify(log.requestPayload)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "help" }}>
                      <Tooltip 
                        title={<Box component="pre" sx={{ fontSize: '0.75rem', p: 1 }}>{JSON.stringify(log.responsePayload, null, 2)}</Box>} 
                        arrow 
                        placement="top"
                      >
                        <span>{JSON.stringify(log.responsePayload)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          backgroundColor:
                            log.status === "success"
                              ? "rgba(34, 197, 94, 0.1)"
                              : log.status === "pending"
                              ? "rgba(234, 179, 8, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                          color:
                            log.status === "success"
                              ? "#22c55e"
                              : log.status === "pending"
                              ? "#eab308"
                              : "#ef4444",
                          borderRadius: "6px",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "help" }}>
                      <Tooltip title={log.errorMessage || ""} arrow placement="top">
                        <span>{log.errorMessage || "—"}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <IconButton onClick={() => setSelectedLog(log)}>
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 5 }}>
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        sx={{ color: "white" }}
      />

      {/* Detail Modal */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="bold">
            Log Details - {selectedLog?.provider}
          </Typography>
          <IconButton onClick={() => setSelectedLog(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box className="flex flex-col gap-4">
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Transaction ID</Typography>
                <Typography variant="body1">{selectedLog.transactionId || "N/A"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Request Payload</Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    p: 2,
                    borderRadius: "8px",
                    overflowX: "auto",
                    color: "#a5b4fc",
                    fontSize: "0.875rem",
                  }}
                >
                  {JSON.stringify(selectedLog.requestPayload, null, 2)}
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Response Payload</Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    p: 2,
                    borderRadius: "8px",
                    overflowX: "auto",
                    color: selectedLog.status === "success" ? "#86efac" : "#fca5a5",
                    fontSize: "0.875rem",
                  }}
                >
                  {JSON.stringify(selectedLog.responsePayload, null, 2)}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrderLogs;
