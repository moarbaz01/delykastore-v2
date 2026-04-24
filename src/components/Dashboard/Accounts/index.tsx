"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { Delete, Edit, Close } from "@mui/icons-material";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useAllProducts } from "@/hooks/useAllProducts";
import {
  useAccounts,
  useUpsertAccount,
  useDeleteAccount,
} from "@/hooks/useAccounts";
import Loader from "@/components/Loader";

interface Account {
  _id: string;
  productId: { _id: string; name: string };
  costId: string;
  email: string;
  password?: string;
  additionalInfo?: string;
  isActive: boolean;
  isReserved: boolean;
  reservedExpiry?: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  type: string;
  cost: Array<{
    id: string;
    durationDays?: number;
    amount?: string;
    price: string;
  }>;
}

const EMPTY_FORM = {
  email: "",
  password: "",
  additionalInfo: "",
  isActive: true,
};

export default function AccountsClient() {
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedCostId, setSelectedCostId] = useState("all");
  const [showPasswordFor, setShowPasswordFor] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: allProducts = [], isLoading: isLoadingProducts } =
    useAllProducts();
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts(
    selectedProduct,
    selectedCostId,
  );

  const upsertMutation = useUpsertAccount();
  const deleteMutation = useDeleteAccount();

  const products = useMemo(
    () =>
      (allProducts as Product[]).filter((p: Product) => p.type === "account"),
    [allProducts],
  );

  const activeProduct = products.find((p) => p._id === selectedProduct);

  const handleOpenModal = (account: Account | null = null) => {
    if (account) {
      setEditingAccount(account);
      setForm({
        email: account.email,
        password: account.password || "",
        additionalInfo: account.additionalInfo || "",
        isActive: account.isActive,
      });
    } else {
      setEditingAccount(null);
      setForm(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedProduct || selectedProduct === "all") {
      return toast.error("Please select a product first");
    }
    if (!selectedCostId || selectedCostId === "all") {
      return toast.error("Please select a package first");
    }

    try {
      await upsertMutation.mutateAsync({
        id: editingAccount?._id,
        data: {
          ...form,
          productId: selectedProduct,
          costId: selectedCostId,
        },
      });
      toast.success(
        editingAccount
          ? "Account updated successfully"
          : "Account added successfully",
      );
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save account");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this account?"))
      return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Account deleted successfully");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  if (isLoadingProducts || isLoadingAccounts) {
    return <Loader />;
  }

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
          Premium Accounts
        </h1>
        <p className="text-xl font-bold text-primary">
          Total : {accounts.length}
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel shrink>
            Product
          </InputLabel>
          <Select
            value={selectedProduct || "all"}
            label="Product"
            displayEmpty
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setSelectedCostId("all");
            }}
          >
            <MenuItem value="all">All Games</MenuItem>
            {products.map((p) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{ minWidth: 200 }}
          size="small"
          disabled={!selectedProduct || selectedProduct === "all"}
        >
          <InputLabel shrink>
            Package
          </InputLabel>
          <Select
            value={selectedCostId || "all"}
            label="Package"
            displayEmpty
            onChange={(e) => setSelectedCostId(e.target.value)}
          >
            <MenuItem value="all">All Packages</MenuItem>
            {activeProduct?.cost.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.durationDays ? `${c.durationDays} Days` : c.amount} — $
                {c.price}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Plus className="h-4 w-4" />}
          onClick={() => handleOpenModal()}
          disabled={!selectedCostId || selectedCostId === "all"}
          className="h-10 px-8 whitespace-nowrap"
        >
          Add Account
        </Button>
      </div>

      {/* Table */}
      <TableContainer>
        <Table aria-label="accounts table" sx={{ minWidth: 850 }}>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Package</TableCell>
              <TableCell>Email / Username</TableCell>
              <TableCell>Password</TableCell>
              <TableCell>Reserved</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Status</TableCell>
              <TableCell sx={{ textAlign: "right" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((acc: any) => (
                <TableRow key={acc._id} hover>
                  <TableCell>
                    {acc.productId?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const product = products.find(p => p._id === acc.productId?._id);
                      const cost = product?.cost.find(c => c.id === acc.costId);
                      return cost ? (cost.durationDays ? `${cost.durationDays} Days` : cost.amount) : acc.costId;
                    })()}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {acc.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-200 font-mono">
                        {showPasswordFor === acc._id
                          ? acc.password || "—"
                          : "••••••••"}
                      </span>
                      {acc.password && (
                        <button
                          onClick={() =>
                            setShowPasswordFor(
                              showPasswordFor === acc._id ? null : acc._id,
                            )
                          }
                          className="text-xs text-primary hover:underline"
                        >
                          {showPasswordFor === acc._id ? "Hide" : "Show"}
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {acc.isReserved ? (
                      <span className="text-yellow-400 text-xs font-semibold">
                        YES
                      </span>
                    ) : (
                      <span className=" text-xs">NO</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {acc.isReserved && acc.reservedExpiry ? (
                      <span className="text-gray-400 text-xs">
                        {new Date(acc.reservedExpiry).toLocaleString()}
                      </span>
                    ) : (
                      <span className=" text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${acc.isActive
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                    >
                      {acc.isActive ? "AVAILABLE" : "SOLD"}
                    </span>
                  </TableCell>
                  <TableCell sx={{ textAlign: "right" }}>
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        onClick={() => handleOpenModal(acc)}
                        sx={{ color: "#60A5FA" }}
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(acc._id)}
                        sx={{ color: "#EF4444" }}
                        size="small"
                        disabled={deleteMutation.isPending}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {editingAccount ? "Edit Account" : "Add New Account"}
          </Typography>
          <IconButton onClick={() => setIsModalOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email / Username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Additional Info"
            value={form.additionalInfo}
            onChange={(e) =>
              setForm({ ...form, additionalInfo: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={form.isActive as any}
              label="Status"
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.value as any })
              }
            >
              <MenuItem value={true as any}>Available</MenuItem>
              <MenuItem value={false as any}>Sold</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={upsertMutation.isPending}
          >
            {upsertMutation.isPending
              ? "Processing..."
              : editingAccount
                ? "Update Account"
                : "Save Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
