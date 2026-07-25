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
import { Trash2 as Delete, Edit, Plus as Add } from "lucide-react";
import { useRouter } from "next/navigation";
import { Gift } from "@/types/main";

interface GiftsProps {
    gifts: Gift[];
    products: Array<{ _id: string; name: string }>;
    isLoading: boolean;
    onDeleteGift: (id: string) => void;
    // Handlers for compatibility with wrapper (can be empty)
    onCreateGift: (giftData: any) => void;
    onUpdateGift: (id: string, giftData: any) => void;
}

const Gifts: React.FC<GiftsProps> = ({
    gifts,
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
        <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen">
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
                    className="w-64"
                />
                <FormControl size="small" className="w-64">
                    <InputLabel shrink>Filter by Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        displayEmpty
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
                >
                    Create Gift
                </Button>
            </div>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={filteredGifts.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

            {/* Table */}
            <TableContainer>
                <Table>
                    <TableHead>
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
                                <TableRow key={gift._id} hover>
                                    <TableCell>{gift.productId.name}</TableCell>
                                    <TableCell>{gift.bannerText || "N/A"}</TableCell>
                                    <TableCell>
                                        {gift.wageringLevels && gift.wageringLevels.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {gift.wageringLevels.map((lvl) => (
                                                    <div key={lvl.level} className="text-xs">
                                                        L{lvl.level}: <span className="text-primary font-bold">${lvl.wagering}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            "N/A"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={gift.isActive ? "Active" : "Inactive"}
                                            color={gift.isActive ? "success" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
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

        </div>
    );
};

export default Gifts;
