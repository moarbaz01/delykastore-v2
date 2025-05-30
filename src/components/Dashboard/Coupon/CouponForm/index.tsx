// components/CouponForm.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

interface CostItem {
  id: string;
  amount: string;
  price: string;
}
interface Product {
  _id: string;
  name: string;
  price: number;
  cost: CostItem[];
}

interface CouponFormProps {
  products: Product[];
  initialData?: {
    coupon: string;
    discount: number;
    maxDiscount?: number;
    minAmount: number;
    startDate: Date;
    expiry: Date;
    isActive: boolean;
    selectedProducts: string;
    selectedCosts: string[];
    limit: number;
    type: string;
  };
  isEdit?: boolean;
  couponId?: string;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  products,
  initialData,
  isEdit = false,
  couponId,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    coupon: initialData?.coupon || "",
    discount: initialData?.discount || 0,
    maxDiscount: initialData?.maxDiscount || undefined,
    minAmount: initialData?.minAmount || 0,
    startDate: initialData?.startDate || null,
    expiry: initialData?.expiry || null,
    isActive: initialData?.isActive || true,
    selectedProducts: initialData?.selectedProducts || "",
    selectedCosts: initialData?.selectedCosts || [],
    limit: initialData?.limit || 0,
    type: initialData?.type || "percentage", // default to percentage
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset discount validation when type changes
    if (name === "type") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.discount;
        return newErrors;
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? new Date(value) : null,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleProductSelect = (productId: string) => {
    setFormData((prev) => ({ ...prev, selectedProducts: productId }));
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const selectedProductCosts = useMemo(() => {
    const p = products.find((p) => p._id === formData.selectedProducts);
    if (!p) return [];
    return p.cost.map((c) => ({
      id: c.id,
      amount: c.amount,
      price: c.price,
    }));
  }, [formData.selectedProducts, products]);

  const handleCostSelect = (costId: string) => {
    setFormData((prev) => {
      const newSelectedCosts = prev.selectedCosts.includes(costId)
        ? prev.selectedCosts.filter((id) => id !== costId)
        : [...prev.selectedCosts, costId];
      return {
        ...prev,
        selectedCosts: newSelectedCosts,
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const selectedProductsData = products.filter((p) =>
      formData.selectedProducts.includes(p._id)
    );

    if (!formData.coupon.trim()) {
      newErrors.coupon = "Coupon code is required";
    }

    if (formData.type === "percentage") {
      if (formData.discount <= 0 || formData.discount > 100) {
        newErrors.discount = "Percentage discount must be between 1 and 100";
      }
    } else {
      // Flat discount validation
      if (formData.discount <= 0) {
        newErrors.discount = "Flat discount must be greater than 0";
      }

      // Check if flat discount exceeds any product price
      const productsWithLowPrice = selectedProductsData.filter(
        (p) => p.price < formData.discount
      );

      if (productsWithLowPrice.length > 0) {
        newErrors.discount = `Discount cannot exceed product price (${productsWithLowPrice[0].name} costs $${productsWithLowPrice[0].price})`;
      }
    }

    if (formData.type === "percentage") {
      if (formData.maxDiscount && formData.maxDiscount <= 0) {
        newErrors.maxDiscount = "Maximum discount must be greater than 0";
      }
    }

    if (formData.minAmount <= 0) {
      newErrors.minAmount = "Minimum amount must be greater than 0";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.expiry) {
      newErrors.expiry = "Expiry date is required";
    } else if (formData.startDate && formData.expiry < formData.startDate) {
      newErrors.expiry = "Expiry date must be after start date";
    }

    if (formData.selectedProducts.length === 0) {
      newErrors.selectedProducts = "At least one product must be selected";
    }

    if (formData.limit <= 0) {
      newErrors.limit = "Limit must be greater than 0";
    }

    const isCostPriceGreaterThenMinAmount = selectedProductCosts.some((c) =>
      formData.selectedCosts.includes(c.id)
        ? Number(c.price) > formData.minAmount
        : false
    );

    if (!isCostPriceGreaterThenMinAmount) {
      newErrors.minAmount =
        "Minimum amount must be less than to the selected cost price";
    }
    if (formData.selectedCosts.length === 0) {
      newErrors.selectedCosts = "At least one cost must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const url = isEdit ? `/api/coupon?id=${couponId}` : "/api/coupon";
      const method = isEdit ? "PUT" : "POST";

      console.log("formdata", formData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coupon: formData.coupon,
          discount: formData.discount,
          maxDiscount: formData.maxDiscount,
          minAmount: formData.minAmount,
          startDate: formData.startDate,
          expiry: formData.expiry,
          isActive: formData.isActive,
          selectedProducts: formData.selectedProducts,
          selectedCosts: formData.selectedCosts,
          limit: formData.limit,
          type: formData.type,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/coupons");
        router.refresh();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to save coupon");
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to save coupon",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen bg-gray-900">
      <Typography variant="h6" gutterBottom>
        {isEdit ? "Edit Coupon" : "Create New Coupon"}
      </Typography>
      <Paper
        className="p-6 rounded-md"
        sx={{ backgroundColor: "#374151", color: "#D1D5DB" }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Coupon Code"
                name="coupon"
                value={formData.coupon}
                onChange={handleChange}
                error={!!errors.coupon}
                helperText={errors.coupon}
                disabled={isEdit}
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isActive}
                    name="isActive"
                    color="primary"
                    onChange={handleCheckboxChange}
                  />
                }
                label="Active Coupon"
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                fullWidth
                name="type"
                value={formData.type}
                onChange={handleSelectChange}
                error={!!errors.type}
                sx={{
                  backgroundColor: "#1F2937",
                  color: "#E5E7EB",
                }}
              >
                <MenuItem value="percentage">Percentage Discount</MenuItem>
                <MenuItem value="flat">Flat Discount</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={formData.type === "percentage" ? 6 : 12}>
              <TextField
                fullWidth
                label={
                  formData.type === "percentage"
                    ? "Discount (%)"
                    : "Discount Amount"
                }
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleChange}
                error={!!errors.discount}
                helperText={errors.discount}
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                InputProps={{
                  endAdornment:
                    formData.type === "percentage" ? (
                      <InputAdornment position="end">%</InputAdornment>
                    ) : (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                }}
              />
            </Grid>
            {formData.type === "percentage" && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Discount Amount (Optional)"
                  name="maxDiscount"
                  type="number"
                  value={formData.maxDiscount || ""}
                  onChange={handleChange}
                  error={!!errors.maxDiscount}
                  helperText={errors.maxDiscount}
                  sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Order Amount"
                name="minAmount"
                type="number"
                value={formData.minAmount}
                onChange={handleChange}
                error={!!errors.minAmount}
                helperText={errors.minAmount}
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Coupon Usage Limit"
                name="limit"
                type="number"
                value={formData.limit}
                onChange={handleChange}
                error={!!errors.limit}
                helperText={errors.limit}
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                name="startDate"
                value={formatDateForInput(formData.startDate)}
                onChange={handleDateChange}
                error={!!errors.startDate}
                helperText={errors.startDate}
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                name="expiry"
                value={formatDateForInput(formData.expiry)}
                onChange={handleDateChange}
                error={!!errors.expiry}
                helperText={errors.expiry}
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.selectedProducts}>
                <InputLabel>Applicable Products</InputLabel>
                <Select
                  value={formData.selectedProducts}
                  sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                >
                  {products.map((product) => (
                    <MenuItem
                      key={product._id}
                      value={product._id}
                      onClick={() => handleProductSelect(product._id)}
                    >
                      {product.name} (${product.price})
                    </MenuItem>
                  ))}
                </Select>
                {errors.selectedProducts && (
                  <FormHelperText>{errors.selectedProducts}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            {/* Cost Selection */}
            {formData.selectedProducts.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Selected Products Costs</InputLabel>
                  <Select
                    multiple
                    value={formData.selectedCosts}
                    sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                    renderValue={(selected) =>
                      (selected as string[])
                        .map((id) => {
                          const cost = selectedProductCosts.find(
                            (c) => c.id === id
                          );
                          return cost ? `${cost.amount} $${cost.price}` : "";
                        })
                        .filter(Boolean)
                        .join(", ")
                    }
                  >
                    {selectedProductCosts.map((cost) => (
                      <MenuItem
                        onClick={() => handleCostSelect(cost.id)}
                        key={cost.id}
                        value={cost.id}
                      >
                        <Checkbox
                          checked={formData.selectedCosts.includes(cost.id)}
                        />
                        {products.find((p) => p._id === cost.id)?.name}
                        {cost.amount} ${cost.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/dashboard/coupons")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEdit
                    ? "Update Coupon"
                    : "Create Coupon"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};
