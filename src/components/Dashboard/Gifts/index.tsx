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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
    Chip,
    Button,
    IconButton,
} from "@mui/material";
import { Delete, Edit, Add } from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface Gift {
    _id: string;
    productId: {
        _id: string;
        name: string;
    };
    bannerText?: string;
    startDate?: string;
    endDate?: string;
    features?: Array<{
        title: string;
        value: string;
    }>;
    wagering: string
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface GiftsProps {
    gifts: Gift[];
    products: Array<{ _id: string; name: string }>;
    isLoading: boolean;
    onCreateGift: (giftData: any) => void;
    onUpdateGift: (id: string, giftData: any) => void;
    onDeleteGift: (id: string) => void;
}

const Gifts: React.FC<GiftsProps> = ({
    gifts,
    isLoading,
    onDeleteGift,
}) => {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [productFilter, setProductFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm("Do you really want to delete this gift?")) {
            return;
        }
        await onDeleteGift(id);
    };

    // Filtering logic
    const filteredGifts = gifts
        .filter((gift) =>
            gift.productId.name.toLowerCase().includes(productFilter.toLowerCase())
        )
        .filter((gift) =>
            statusFilter === "active"
                ? gift.isActive
                : statusFilter === "inactive"
                    ? !gift.isActive
                    : true
        );

    // Pagination
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen bg-gray-900">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white mb-6">Gifts Management</h1>
                <p className="text-2xl font-bold text-white mb-6">
                    Total: {gifts?.length || 0}
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <TextField
                    label="Filter by Product"
                    variant="outlined"
                    size="small"
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="w-64 bg-gray-700"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#4B5563',
                            },
                            '&:hover fieldset': {
                                borderColor: '#6B7280',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#ff962d',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#9CA3AF',
                        },
                        '& .MuiInputBase-input': {
                            color: 'white',
                        },
                    }}
                />
                <FormControl size="small" className="w-64">
                    <InputLabel className="text-gray-300">Filter by Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-700 text-white"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#4B5563',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#6B7280',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#ff962d',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#9CA3AF',
                            },
                            '& .MuiSelect-select': {
                                color: 'white',
                            },
                        }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {/* Create Button */}
            <div className="mb-4">
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => router.push("/dashboard/gifts/create")}
                    sx={{
                        backgroundColor: "#f68181",
                        "&:hover": {
                            backgroundColor: "#f68181c7",
                        },
                        fontSize: "12px",
                    }}
                >
                    Create Gift
                </Button>
            </div>

            {/* Table */}
            <TableContainer className="bg-gray-800 rounded-xl">
                <Table>
                    <TableHead className="bg-gray-600">
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Banner Text</TableCell>
                            <TableCell>Wagering</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredGifts
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((gift) => (
                                <TableRow key={gift._id}>
                                    <TableCell className="text-white">{gift.productId.name}</TableCell>
                                    <TableCell className="text-white">{gift.bannerText || "N/A"}</TableCell>
                                    <TableCell className="text-white">
                                        {gift.wagering
                                            ? `${gift.wagering}`
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={gift.isActive ? "Active" : "Inactive"}
                                            color={gift.isActive ? "success" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell className="text-white">
                                        {new Date(gift.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <IconButton
                                                size="small"
                                                onClick={() => router.push(`/dashboard/gifts/${gift._id}/edit`)}
                                                className="text-blue-400 hover:text-blue-300"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(gift._id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Delete />
                                            </IconButton>
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
                count={filteredGifts.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                    '& .MuiTablePagination-root': {
                        color: 'white',
                    },
                    '& .MuiIconButton-root': {
                        color: 'white',
                    },
                    '& .MuiSelect-select': {
                        color: 'white',
                    },
                    '& .MuiMenuItem-root': {
                        color: 'black',
                    },
                }}
            />
        </div>
    );
};

export default Gifts;
