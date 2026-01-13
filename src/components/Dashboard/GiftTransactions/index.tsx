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
} from "@mui/material";
import { CgEye } from "react-icons/cg";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

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
            {Array.from({ length: 7 }).map((_, cellIndex) => (
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
    const [statusFilter, setStatusFilter] = useState(
        searchParams.get("status") || "",
    );
    const [userIdFilter, setUserIdFilter] = useState(
        searchParams.get("userId") || "",
    );
    const [giftIdFilter, setGiftIdFilter] = useState(
        searchParams.get("giftId") || "",
    );

    const updateFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Reset to first page when filters change
        params.set("page", "1");

        // Update filter params
        if (statusFilter) params.set("status", statusFilter);
        else params.delete("status");

        if (userIdFilter) params.set("userId", userIdFilter);
        else params.delete("userId");

        if (giftIdFilter) params.set("giftId", giftIdFilter);
        else params.delete("giftId");

        router.push(`${pathname}?${params.toString()}`);
    };

    // Debounce the filter updates
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [statusFilter, userIdFilter, giftIdFilter]);

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

    const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
        try {
            const response = await axios.put('/api/gift-transaction', {
                id: transactionId,
                status: newStatus
            });

            if (response.data) {
                toast.success('Transaction status updated successfully');
                // Refetch the data to show updated status
                window.location.reload();
            }
        } catch (error) {
            toast.error('Failed to update transaction status');
            console.error('Error updating transaction status:', error);
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
                <TextField
                    fullWidth
                    size="small"
                    label="Search by User ID"
                    variant="outlined"
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
                    sx={{ width: "300px" }}
                />

                <TextField
                    fullWidth
                    size="small"
                    label="Search by Gift ID"
                    variant="outlined"
                    value={giftIdFilter}
                    onChange={(e) => setGiftIdFilter(e.target.value)}
                    sx={{ width: "300px" }}
                />

                <FormControl size="small" className="w-64">
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e: SelectChangeEvent<string>) =>
                            setStatusFilter(e.target.value)
                        }
                        label="Filter by Status"
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {/* Table */}
            <TableContainer className="bg-gray-800 rounded-xl">
                <Table>
                    <TableHead className="bg-gray-600">
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading
                            ? renderSkeletonRows(rowsPerPage)
                            : sortedTransactions?.map((transaction) => (
                                <TableRow key={transaction?._id}>
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
                                        <FormControl size="small" className="w-32">
                                            <Select
                                                value={transaction?.status}
                                                onChange={(e: SelectChangeEvent<string>) =>
                                                    updateTransactionStatus(transaction?._id, e.target.value)
                                                }
                                                className="text-white"
                                                renderValue={(value) => (
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${value === "success"
                                                                    ? "bg-green-500"
                                                                    : value === "pending"
                                                                        ? "bg-yellow-500"
                                                                        : "bg-red-500"
                                                                }`}
                                                        />
                                                        {value === "success" ? "Success" : value === "pending" ? "Pending" : "Failed"}
                                                    </div>
                                                )}
                                            >
                                                <MenuItem value="pending">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                        Pending
                                                    </div>
                                                </MenuItem>
                                                <MenuItem value="success">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        Success
                                                    </div>
                                                </MenuItem>
                                                <MenuItem value="failed">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                                        Failed
                                                    </div>
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
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
