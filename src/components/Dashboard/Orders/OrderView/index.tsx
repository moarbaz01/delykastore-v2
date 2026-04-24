"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Divider,
  Button,
  Paper,
  Grid,
  Chip,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  CalendarToday,
  Person,
  Receipt,
  Gamepad,
  AttachMoney,
  CheckCircle,
  Error,
  Pending,
} from "@mui/icons-material";
import { useUpdateOrderStatus } from "@/hooks/useOrders";

interface Order {
  _id: string;
  createdAt: string;
  product?: { name: string };
  user?: { email: string };
  status: "pending" | "success" | "failed";
  orderType: string;
  gameCredentials?: {
    zoneId?: string;
    userId?: string;
    game?: string;
  };
  failureReason?: string;
  amount: string;
  couponCode?: string;
  couponDetails?: {
    code: string;
    type: "flat" | "percentage";
    discountValue: number;
  };
  accountDetails?: {
    email: string;
    password?: string;
    additionalInfo?: string;
  };
  expiresAt?: string;
}

const InfoRow = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: any;
}) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: "flex", itemsCenter: "center", gap: 1, mb: 0.5 }}>
      {Icon && <Icon sx={{ fontSize: 16, color: "#94a3b8" }} />}
      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
      {value || "—"}
    </Typography>
  </Box>
);

const OrderView = ({ order }: { order: Order }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const updateMutation = useUpdateOrderStatus();

  const handleUpdate = async () => {
    await updateMutation.mutateAsync({
      id: order._id,
      status: selectedStatus,
    });
  };

  const statusColors = {
    pending: { bg: "rgba(234, 179, 8, 0.1)", text: "#eab308", icon: Pending },
    success: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", icon: CheckCircle },
    failed: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", icon: Error },
  };

  const currentStatus = statusColors[order.status] || statusColors.pending;

  return (
    <div className="md:pl-72 md:py-8 md:px-8 px-4 min-h-screen">
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ color: "white", fontWeight: 800, mb: 1 }}>
            Order Details
          </Typography>
          <Typography variant="body2" color="textSecondary">
            ID: {order._id}
          </Typography>
        </Box>
        <Chip
          icon={<currentStatus.icon sx={{ color: `${currentStatus.text} !important` }} />}
          label={order.status.toUpperCase()}
          sx={{
            backgroundColor: currentStatus.bg,
            color: currentStatus.text,
            fontWeight: "bold",
            borderRadius: "8px",
            px: 1,
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              General Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Product" value={order.product?.name || "N/A"} icon={Receipt} />
                <InfoRow label="User Email" value={order.user?.email || "N/A"} icon={Person} />
                <InfoRow
                  label="Date Ordered"
                  value={new Date(order.createdAt).toLocaleString()}
                  icon={CalendarToday}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow
                  label="Total Amount"
                  value={`$${order.amount}`}
                  icon={AttachMoney}
                />
                <InfoRow label="Order Type" value={order.orderType.toUpperCase()} />
                {order.couponCode && (
                  <InfoRow
                    label="Coupon Applied"
                    value={
                      <Box>
                        <Typography variant="body1" sx={{ color: "#fbbf24", fontWeight: "bold" }}>
                          {order.couponCode}
                        </Typography>
                        {order.couponDetails && (
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                            {order.couponDetails.type === "percentage"
                              ? `${order.couponDetails.discountValue}% Off`
                              : `$${order.couponDetails.discountValue} Off`}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                )}
              </Grid>
            </Grid>

            {order.failureReason && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: "rgba(239, 68, 68, 0.05)", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.1)" }}>
                <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: "bold" }}>
                  Failure Reason
                </Typography>
                <Typography variant="body1" sx={{ color: "#fca5a5" }}>
                  {order.failureReason}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Game Credentials */}
          {order.gameCredentials && (
            <Paper
              sx={{
                p: 3,
                mt: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <Gamepad sx={{ color: "#60a5fa" }} />
                <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                  Game Credentials
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <InfoRow label="Game" value={order.gameCredentials.game} />
                </Grid>
                <Grid item xs={4}>
                  <InfoRow label="User ID" value={order.gameCredentials.userId} />
                </Grid>
                <Grid item xs={4}>
                  <InfoRow label="Zone ID" value={order.gameCredentials.zoneId} />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Account Details */}
          {order.accountDetails && (
            <Paper
              sx={{
                p: 3,
                mt: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: "#60a5fa", mb: 3, fontWeight: "bold" }}>
                Fulfillment Details (Premium Account)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Email / Username" value={order.accountDetails.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Password" value={order.accountDetails.password} />
                </Grid>
                {order.accountDetails.additionalInfo && (
                  <Grid item xs={12}>
                    <InfoRow label="Additional Info" value={order.accountDetails.additionalInfo} />
                  </Grid>
                )}
                {order.expiresAt && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, backgroundColor: "rgba(239, 68, 68, 0.05)", borderRadius: "8px" }}>
                      <Typography variant="caption" sx={{ color: "#ef4444" }}>Expires On</Typography>
                      <Typography variant="body1" sx={{ color: "#fca5a5", fontWeight: "bold" }}>
                        {new Date(order.expiresAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* Sidebar / Actions */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              position: "sticky",
              top: 24,
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              Management
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Update Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Update Status"
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                disabled={order.status === "success"}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              onClick={handleUpdate}
              disabled={updateMutation.isPending || selectedStatus === order.status}
            >
              {updateMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
            {order.status === "success" && (
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 2, textAlign: "center" }}>
                Successful orders cannot be changed.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default OrderView;
