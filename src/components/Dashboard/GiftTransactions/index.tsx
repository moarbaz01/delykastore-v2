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
    Button,
} from "@mui/material";
import { CgEye } from "react-icons/cg";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useUpdateGiftTransactionStatus } from "@/hooks/useGiftTransactions";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface GiftTransaction {
    _id: string;
    userId: string;
    cost: string;
    status: string;
    userWagering: number;
    wagering: number;
    level: string;
    giftId: string;
    createdAt: string;
    updatedAt: string;
    productId?: {
        name: string;
        image: string;
        cost: Array<{
            id: string;
            price: string;
            amount: string;
            note?: string;
            image?: string;
            category: string;
        }>;
    };
    costDetails?: {
        id: string;
        price: string;
        amount: string;
        note?: string;
        image?: string;
        category: string;
    };
}

interface GiftTransactionsProps {
    allTransactions: GiftTransaction[];
    totalTransactions: number;
    isLoading: boolean;
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

const GiftTransactions: React.FC<GiftTransactionsProps> = ({
    allTransactions,
    totalTransactions,
    isLoading,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get current pagination values
    const page = parseInt(searchParams.get("page") || "1") - 1;
    const rowsPerPage = parseInt(searchParams.get("limit") || "10");

    // State for filters that will be added to URL
    const [monthFilter, setMonthFilter] = useState(
        searchParams.get("month") || ""
    );
    const [statusFilter, setStatusFilter] = useState(
        searchParams.get("status") || ""
    );
    const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [userIdFilter, setUserIdFilter] = useState(
        searchParams.get("userId") || ""
    );

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

        if (search) params.set("search", search);
        else params.delete("search");

        if (userIdFilter) params.set("userId", userIdFilter);
        else params.delete("userId");

        router.push(`${pathname}?${params.toString()}`);
    };

    // Debounce the filter updates
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [monthFilter, statusFilter, dateFilter, search, userIdFilter]);

    const handleChangePage = (event: unknown, newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", (newPage + 1).toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>,
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

    const sortedTransactions = useMemo(() => {
        return [...allTransactions].sort((a, b) => {
            if (orderDirection === "asc") {
                return a[orderBy] > b[orderBy] ? 1 : -1;
            } else {
                return a[orderBy] < b[orderBy] ? 1 : -1;
            }
        });
    }, [allTransactions, orderBy, orderDirection]);

    const updateStatusMutation = useUpdateGiftTransactionStatus();

    const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
        try {
            await updateStatusMutation.mutateAsync({
                id: transactionId,
                status: newStatus
            });
        } catch (error) {
            // error is handled in mutation
        }
    };

    return (
        <div className="md:ml-72 md:py-6 md:px-6 px-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white mb-6">
                    Gift Transactions
                </h1>
                <p className="text-2xl font-bold text-white mb-6">
                    Total : {totalTransactions || 0}
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
                    label="Search by Trans ID"
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: "300px" }}
                />

                <TextField
                    fullWidth
                    size="small"
                    label="Search by User ID"
                    variant="outlined"
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
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
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="success">Success</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
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

            {/* Table */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>User ID</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>User Wagering</TableCell>
                            <TableCell>Required Wagering</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "createdAt"}
                                    direction={orderDirection}
                                    onClick={() => {
                                        setOrderDirection(
                                            orderBy === "createdAt" && orderDirection === "desc"
                                                ? "asc"
                                                : "desc",
                                        );
                                        setOrderBy("createdAt");
                                    }}
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
                            : sortedTransactions?.map((transaction) => (
                                <TableRow key={transaction?._id} hover>
                                    <TableCell>{transaction?._id}</TableCell>
                                    <TableCell>{transaction?.userId}</TableCell>
                                    <TableCell>{transaction?.productId?.name || "N/A"}</TableCell>
                                    <TableCell>
                                        {transaction?.costDetails ? (
                                            <div>
                                                <div className="font-semibold">${transaction?.costDetails?.price}</div>
                                                <div className="text-sm text-gray-400">{transaction?.costDetails?.amount}</div>
                                                <div className="text-xs text-gray-500">ID: {transaction?.cost}</div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div>${transaction?.cost}</div>
                                                <div className="text-xs text-gray-500">No details</div>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>${transaction?.userWagering}</TableCell>
                                    <TableCell>
                                        ${transaction?.wagering}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(transaction?.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={transaction?.status?.toUpperCase()}
                                            size="small"
                                            sx={{ fontWeight: "bold" }}
                                            color={
                                                transaction?.status === "success"
                                                    ? "success"
                                                    : transaction?.status === "pending"
                                                        ? "warning"
                                                        : "error"
                                            }
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "right" }}>
                                        <div className="flex gap-2">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                disabled={transaction?.status === "success" || updateStatusMutation.isPending}
                                                onClick={() => updateTransactionStatus(transaction?._id, "success")}
                                            >
                                                {updateStatusMutation.isPending && updateStatusMutation.variables?.id === transaction?._id ? "..." : "Success"}
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="warning"
                                                disabled={transaction?.status === "pending" || updateStatusMutation.isPending}
                                                onClick={() => updateTransactionStatus(transaction?._id, "pending")}
                                            >
                                                {updateStatusMutation.isPending && updateStatusMutation.variables?.id === transaction?._id ? "..." : "Pending"}
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="error"
                                                disabled={transaction?.status === "failed" || updateStatusMutation.isPending}
                                                onClick={() => updateTransactionStatus(transaction?._id, "failed")}
                                            >
                                                {updateStatusMutation.isPending && updateStatusMutation.variables?.id === transaction?._id ? "..." : "Failed"}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={totalTransactions}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div>
    );
};

export default GiftTransactions;
