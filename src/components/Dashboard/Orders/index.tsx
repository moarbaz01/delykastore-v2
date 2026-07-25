"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  SelectChangeEvent,
  Chip,
  Tooltip,
} from "@mui/material";
import { CgEye } from "react-icons/cg";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Order {
  _id: string;
  amount: number;
  createdAt: string;
  status: string;
  transactionId: string | null;
  product?: {
    name: string;
  };
  user: {
    email: string;
  };
  orderDetails: string;
  gameCredentials: {
    userId: string;
    zoneId: string;
    game?: string;
  };
  orderType?: string;
  couponCode?: string;
  couponDetails?: {
    code: string;
    type: string;
    discountValue: number;
    maxDiscount: number;
    minAmount: number;
  };
}

interface OrdersProps {
  allOrders: Order[];
  totalOrders: number;
  isLoading: boolean;
}

const renderSkeletonRows = (rowCount: number = 10) => {
  return Array.from({ length: rowCount }).map((_, index) => (
    <TableRow key={index} className="py-4">
      {Array.from({ length: 11 }).map((_, cellIndex) => (
        <TableCell key={cellIndex}>
          <Skeleton height={40} baseColor="#3f3f46" highlightColor="#52525b" />
        </TableCell>
      ))}
    </TableRow>
  ));
};

const Orders: React.FC<OrdersProps> = ({
  allOrders,
  totalOrders,
  isLoading,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current pagination values
  const page = parseInt(searchParams.get("page") || "1") - 1;
  const rowsPerPage = parseInt(searchParams.get("limit") || "25");

  // State for filters that will be added to URL
  const [monthFilter, setMonthFilter] = useState(
    searchParams.get("month") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [orderTypeFilter, setOrderTypeFilter] = useState(
    searchParams.get("orderType") || ""
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [transactionSearch, setTransactionSearch] = useState(
    searchParams.get("transactionId") || ""
  );

  const [gameFilter, setGameFilter] = useState(searchParams.get("game") || "");
  // const [userEmailFilter, setUserEmailFilter] = useState(
  //   searchParams.get("user-email") || ""
  // );
  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset to first page when filters change
    params.set("page", "1");

    // Update filter params
    if (monthFilter) params.set("month", monthFilter);
    else params.delete("month");

    if (statusFilter) params.set("status", statusFilter);
    else params.delete("status");

    if (dateFilter) params.set("date", dateFilter);
    else params.delete("date");

    if (orderTypeFilter) params.set("orderType", orderTypeFilter);
    else params.delete("orderType");

    if (search) params.set("search", search);
    else params.delete("search");

    if (transactionSearch) params.set("transactionId", transactionSearch);
    else params.delete("transactionId");

    if (gameFilter) params.set("game", gameFilter);
    else params.delete("game");

    // if (userEmailFilter) params.set("user-email", userEmailFilter);
    // else params.delete("user-email");

    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounce the filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    monthFilter,
    statusFilter,
    dateFilter,
    orderTypeFilter,
    search,
    transactionSearch,
    gameFilter,
    // userEmailFilter,
  ]);

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

  // Client-side sorting only (since filtering is server-side)
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("createdAt");

  const sortedOrders = useMemo(() => {
    return [...(allOrders || [])].sort((a, b) => {
      if (orderDirection === "asc") {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      } else {
        return a[orderBy] < b[orderBy] ? 1 : -1;
      }
    });
  }, [allOrders, orderBy, orderDirection]);

  return (
    <div className="md:ml-72 md:py-6 md:px-6 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white mb-6">Orders</h1>
        <p className="text-2xl font-bold text-white mb-6">
          Total : {totalOrders || 0}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <FormControl size="small" className="w-64">
          <InputLabel shrink>Filter by Month</InputLabel>
          <Select
            value={monthFilter}
            displayEmpty
            onChange={(e: SelectChangeEvent<string>) =>
              setMonthFilter(e.target.value)
            }
            label="Filter by Month"
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
          value={transactionSearch}
          onChange={(e) => setTransactionSearch(e.target.value)}
          sx={{ width: "300px" }}
        />

        <TextField
          fullWidth
          size="small"
          label="Search by User ID"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "300px" }}
        />

        {/* <TextField
          fullWidth
          size="small"
          label="Search by User Email"
          variant="outlined"
          value={userEmailFilter}
          onChange={(e) => setUserEmailFilter(e.target.value)}
          sx={{ width: "300px" }}
        /> */}

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
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" className="w-64">
          <InputLabel shrink>Filter by Game</InputLabel>
          <Select
            value={gameFilter}
            onChange={(e: SelectChangeEvent<string>) =>
              setGameFilter(e.target.value)
            }
            label="Filter by Game"
            displayEmpty
          >
            <MenuItem value="">Select Game</MenuItem>
            <MenuItem value="mobilelegends-brazil">MLBB Brazil</MenuItem>
            <MenuItem value="mobilelegends-indonesia">MLBB Indonesia </MenuItem>
            <MenuItem value="mobilelegends-philippines">
              MLBB Philippines
            </MenuItem>
            <MenuItem value="mobilelegends-malaysia">MLBB Malaysia</MenuItem>
            <MenuItem value="freefire">Free Fire</MenuItem>
            <MenuItem value="pubg">PUBG Global</MenuItem>
            <MenuItem value="honorofkings">Honor Of Kings</MenuItem>
            <MenuItem value="magicchess">Magic Chess</MenuItem>
            <MenuItem value="bloodstrike">Blood Strike</MenuItem>
            <MenuItem value="genshinimpact">Genshin Impact</MenuItem>
            <MenuItem value="Custom Game">Custom</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" className="w-64">
          <InputLabel shrink>Filter by Order Type</InputLabel>
          <Select
            value={orderTypeFilter}
            onChange={(e: SelectChangeEvent<string>) =>
              setOrderTypeFilter(e.target.value)
            }
            label="Filter by Order Type"
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="API Order">API Order</MenuItem>
            <MenuItem value="Custom Order">Custom Order</MenuItem>
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
        count={totalOrders}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Table */}
      <TableContainer>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>OrderType</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell sx={{ maxWidth: 150 }}>Pack</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Zone ID</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "createdAt"}
                  direction={orderDirection}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell sx={{ textAlign: "right" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? renderSkeletonRows(rowsPerPage)
              : sortedOrders?.map((order) => (
                <TableRow key={order?._id} hover>
                  <TableCell>{order?.transactionId || "N/A"}</TableCell>
                  <TableCell>{order?.orderType || "N/A"}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>${order?.amount}</TableCell>
                  <TableCell>
                    {order?.couponDetails?.discountValue
                      ? `${order?.couponDetails.type === "flat" ? "$" : ""}${order?.couponDetails?.discountValue
                      }${order?.couponDetails?.type === "percentage" ? "%" : ""}`
                      : "None"}
                  </TableCell>
                  <TableCell sx={{
                    maxWidth: 150,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "help"
                  }}>
                    <Tooltip title={order?.orderDetails || "N/A"} arrow placement="top">
                      <span>{order?.orderDetails || "N/A"}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {order?.product?.name || "Manual"}
                  </TableCell>
                  <TableCell>
                    {order?.gameCredentials?.userId || "N/A"}
                  </TableCell>
                  <TableCell>
                    {order?.gameCredentials?.zoneId || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(order?.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order?.status?.toUpperCase()}
                      size="small"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor:
                          order?.status === "success" ? "rgba(34, 197, 94, 0.1)" :
                            order?.status === "pending" ? "rgba(234, 179, 8, 0.1)" :
                              "rgba(239, 68, 68, 0.1)",
                        color:
                          order?.status === "success" ? "#22c55e" :
                            order?.status === "pending" ? "#eab308" :
                              "#ef4444",
                        borderRadius: "6px"
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "right" }}>
                    <button
                      onClick={() =>
                        router.push(`/dashboard/orders/${order?._id}`)
                      }
                      className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                    >
                      <CgEye size={20} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Orders;
