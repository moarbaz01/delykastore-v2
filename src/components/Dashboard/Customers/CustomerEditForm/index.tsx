"use client";

import React, { useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";

interface CustomerEditFormProps {
  customer?: {
    _id: string;
    role: string;
    isDeleted: boolean;
    isBlocked: boolean;
    email?: string;
  };
}

const CustomerEditForm: React.FC<CustomerEditFormProps> = ({ customer }) => {
  const [formData, setFormData] = useState({
    _id: customer?._id || "",
    email: customer?.email || "",
    role: customer?.role || "user",
    isDeleted: customer?.isDeleted || false,
    isBlocked: customer?.isBlocked || false,
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, role: value as string }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear password error when typing
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const validatePassword = () => {
    if (formData.password && formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    const isConfirm = confirm("Are you sure?");
    if (!isConfirm) return;

    // Only validate password if it's being changed (not empty)
    if (formData.password && !validatePassword()) {
      return;
    }

    try {
      const endpoint = `/api/user?id=${formData._id}`;
      const payload: any = {
        role: formData.role,
        isDeleted: formData.isDeleted,
        isBlocked: formData.isBlocked,
      };

      // Only include password if it's being changed
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await axios.put(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        toast.success("Customer updated successfully!");
        // Clear password fields after successful update
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update customer."
      );
    }
  };

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">
        {customer ? "Edit Customer" : "Create Customer"}
      </h1>
      <Paper className="p-6">
        <form>
          {/* Email (only for display if editing existing customer) */}
          {customer?.email && (
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              value={formData.email}
              InputProps={{
                readOnly: true,
              }}
            />
          )}

          {/* Role */}
          <FormControl fullWidth margin="normal">
            <Select
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          {/* Password Fields (only shown when editing) */}
          {customer && (
            <>
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="New Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={!!passwordError}
                helperText={passwordError}
              />
            </>
          )}

          {/* Is Deleted */}
          <FormControlLabel
            control={
              <Checkbox
                name="isDeleted"
                checked={formData.isDeleted}
                onChange={handleCheckboxChange}
              />
            }
            label="Is Deleted"
          />

          {/* Is Blocked */}
          <FormControlLabel
            control={
              <Checkbox
                name="isBlocked"
                checked={formData.isBlocked}
                onChange={handleCheckboxChange}
              />
            }
            label="Is Blocked"
          />

          {/* Submit Button */}
          <div className="mt-4">
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              fullWidth
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default CustomerEditForm;
