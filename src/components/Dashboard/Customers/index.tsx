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
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  DialogActions,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

interface Customer {
  _id: string;
  email: string;
  role: "admin" | "user";
  isBlocked: boolean;
  createdAt: string;
  isDeleted: boolean;
  updatedAt: string;
}
const Customers = ({ allCustomers }) => {
  const [customers, setCustomers] = useState<Customer[]>(allCustomers);
  const [orderBy] = useState<string>("createdAt");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [blockedFilter, setBlockedFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState({
    role: "user",
    email: "",
    password: "",
  });
  const router = useRouter();

  // Open/close modal handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewUser({ email: "", password: "", role: "user" }); // Reset form on close
  };

  // Handle input changes for new user
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role change
  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    setNewUser((prev) => ({ ...prev, role: e.target.value }));
  };

  // Handle user creation
  const handleCreateUser = async () => {
    try {
      const res = await axios.post("/api/user", newUser);
      if (res.status === 201) {
        toast.success("User created successfully!");
        setCustomers((prev) => [...prev, res.data]);
        handleCloseModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  //  Handle Change Page
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage + 1);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Do you really wanna delete this user?")) {
      return toast.error("User not deleted");
    }
    const endpoint = `/api/user?id=${id}`;
    const res = await axios.delete(endpoint);
    if (res.status === 200) {
      toast.success("User deleted successfully!");
      setCustomers((prev) => prev.filter((customer) => customer._id !== id));
    } else {
      toast.error("Failed to delete user.");
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleEmailFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmailFilter(event.target.value);
  };

  const handleRoleFilterChange = (event: SelectChangeEvent<string>) => {
    setRoleFilter(event.target.value as string);
  };

  const handleBlockedFilterChange = (event: SelectChangeEvent<string>) => {
    setBlockedFilter(event.target.value as string);
  };
  // Filtering logic
  const filteredCustomers = customers
    .filter((customer) =>
      customer?.email.toLowerCase().includes(emailFilter.toLowerCase())
    )
    .filter((customer) => (roleFilter ? customer.role === roleFilter : true))
    .filter((customer) =>
      blockedFilter === "blocked"
        ? customer.isBlocked
        : blockedFilter === "active"
        ? !customer.isBlocked
        : true
    );

  // Sorting the filtered customers
  const sortedCustomers = filteredCustomers.sort((a, b) =>
    descendingComparator(a, b, orderBy)
  );

  // Current page data
  const currentCustomers = sortedCustomers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="md:ml-72 md:py-6 md:px-6 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white mb-6">Customers</h1>
        <p className="text-2xl font-bold text-white mb-6">
          Total : {customers?.length || 0}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <TextField
          label="Filter by Email"
          variant="outlined"
          size="small"
          value={emailFilter}
          onChange={handleEmailFilterChange}
          className="w-64"
        />
        <FormControl size="small" className="w-64">
          <InputLabel>Filter by Role</InputLabel>
          <Select value={roleFilter} onChange={handleRoleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" className="w-64">
          <InputLabel>Filter by Status</InputLabel>
          <Select value={blockedFilter} onChange={handleBlockedFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="blocked">Blocked</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="mb-4">
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#f68181",
            "&:hover": {
              backgroundColor: "#f68181c7",
            },
            fontSize: "12px",
          }}
          onClick={handleOpenModal}
        >
          Create User
        </Button>
      </div>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1, width: "400px" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleNewUserChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={newUser.password}
              onChange={handleNewUserChange}
              inputProps={{ minLength: 8 }}
              helperText="Password must be at least 8 characters"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={handleCreateUser}
            disabled={!newUser.email || newUser.password.length < 8}
            variant="contained"
            color="primary"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table */}
      <TableContainer className="bg-gray-800 rounded-xl">
        <Table
          sx={{ minWidth: 650 }}
          aria-label="customers table"
          size="medium"
        >
          <TableHead className="bg-gray-600">
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentCustomers.map(
              (customer: any) =>
                !customer?.isDeleted && (
                  <TableRow key={customer._id}>
                    <TableCell>{customer?.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer?.role === "admin" ? "Admin" : "User"}
                        size="small"
                        className="bg-gray-700 text-white"
                      />
                    </TableCell>
                    <TableCell>
                      {customer?.isBlocked ? "Blocked" : "Active"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 md:flex-row flex-col">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/customers/${customer?._id}`)
                          }
                          className="text-primary"
                        >
                          <Edit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(customer?._id)}
                          className="text-red-500"
                        >
                          <Delete />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredCustomers.length}
        page={page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

// Helper function to sort by field
const descendingComparator = (a: any, b: any, orderBy: string) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export default Customers;
