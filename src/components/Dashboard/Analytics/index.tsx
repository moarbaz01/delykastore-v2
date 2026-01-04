"use client";

import React, { useEffect, useState } from "react";
import {
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaDollarSign,
  FaChartLine,
  FaChartBar,
  FaStar,
  FaChartPie,
} from "react-icons/fa";
import {
  CircularProgress,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface AnalyticsData {
  orders: number | null;
  products: number | null;
  customers: number | null;
  revenue: number | null;
  todaysIncome: number | null;
  monthlyIncome: number | null;
  weeklySales: Array<{ _id: string; total: number; count: number }>;
  monthlySales: Array<{ _id: string; total: number; count: number }>;
  orderStatusCounts: Array<{ _id: string; count: number }> | null;
  topProducts: Array<{
    _id: string;
    totalSales: number;
    count: number;
    productDetails: {
      name: string;
      price: string;
    };
  }>;
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    orders: null,
    products: null,
    customers: null,
    revenue: null,
    todaysIncome: null,
    monthlyIncome: null,
    weeklySales: [],
    monthlySales: [],
    topProducts: [],
    orderStatusCounts: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/analytics`);
        if (response.status !== 200) {
          console.error("Failed to fetch analytics data");
          return;
        }

        setAnalyticsData({
          ...response.data,
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchData();
  }, []);

  console.log("order status", analyticsData.orderStatusCounts);

  // Format order status data for the pie chart
  const formatOrderStatusData = (
    statusCounts: Array<{ _id: string; count: number }>
  ) => {
    if (!statusCounts) return [];

    return statusCounts.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      count: item.count,
    }));
  };

  // Get color based on order status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "#10b981"; // green
      case "pending":
        return "#f59e0b"; // yellow
      case "failed":
        return "#ef4444"; // red
      default:
        return "#8884d8"; // default purple
    }
  };

  // Format weekly sales data for chart
  const formatWeeklySales = () => {
    return analyticsData.weeklySales.map((item) => ({
      name: new Date(item._id).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      sales: item.total,
      orders: item.count,
    }));
  };

  // Format monthly sales data for chart
  const formatMonthlySales = () => {
    return analyticsData.monthlySales.map((item) => ({
      name: item._id,
      sales: item.total,
      orders: item.count,
    }));
  };

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">
        Analytics Dashboard
      </h1>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<FaShoppingCart size={24} />}
          title="Orders"
          value={analyticsData.orders}
          color="bg-blue-500"
        />
        <MetricCard
          icon={<FaBox size={24} />}
          title="Products"
          value={analyticsData.products}
          color="bg-yellow-500"
        />
        <MetricCard
          icon={<FaUsers size={24} />}
          title="Customers"
          value={analyticsData.customers}
          color="bg-green-500"
        />
        <MetricCard
          icon={<FaDollarSign size={24} />}
          title="Total Sales"
          value={analyticsData.revenue}
          color="bg-indigo-500"
          isCurrency
        />
      </div>

      {/* Income Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <MetricCard
          icon={<FaChartLine size={24} />}
          title="Today's Income"
          value={analyticsData.todaysIncome}
          color="bg-purple-500"
          isCurrency
        />
        <MetricCard
          icon={<FaChartBar size={24} />}
          title="Monthly Income"
          value={analyticsData.monthlyIncome}
          color="bg-pink-500"
          isCurrency
        />
      </div>

      {/* Order Status Distribution Section */}
      <div className="mt-6">
        <Card sx={{ backgroundColor: " #1f2937" }} className=" p-4 rounded-lg">
          <CardContent>
            <Typography
              variant="h6"
              className="text-gray-300 mb-4 flex items-center"
            >
              <FaChartPie className="mr-2" /> Order Status Distribution
            </Typography>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatOrderStatusData(
                      analyticsData.orderStatusCounts
                    )}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {formatOrderStatusData(analyticsData.orderStatusCounts).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getStatusColor(entry.name)}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#a4b3c7",
                      borderColor: "#4b5563",
                      borderRadius: "0.5rem",
                      padding: "0.5rem",
                      color: "#9ca3af",
                    }}
                    formatter={(value, name) => [`${value} orders`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card sx={{ backgroundColor: " #1f2937" }} className=" p-4 rounded-lg">
          <CardContent>
            <Typography
              variant="h6"
              className="text-gray-300 mb-4 flex items-center"
            >
              <FaChartLine className="mr-2" /> Weekly Sales
            </Typography>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatWeeklySales()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#4b5563",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Sales ($)"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: " #1f2937" }} className=" p-4 rounded-lg">
          <CardContent>
            <Typography
              variant="h6"
              className="text-gray-300 mb-4 flex items-center"
            >
              <FaChartBar className="mr-2" /> Monthly Sales Trend
            </Typography>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatMonthlySales()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#4b5563",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="sales"
                    fill="#8884d8"
                    name="Sales ($)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Section */}
      <div className="mt-6">
        <Card sx={{ backgroundColor: " #1f2937" }} className=" p-4 rounded-lg">
          <CardContent>
            <Typography
              variant="h6"
              className="text-gray-300 mb-4 flex items-center"
            >
              <FaStar className="mr-2" /> Top Performing Products
            </Typography>
            <List className="divide-y divide-gray-700">
              {analyticsData.topProducts.map((product, index) => (
                <ListItem key={index} className="hover:bg-gray-700 rounded">
                  <ListItemText
                    primary={product.productDetails.name}
                    secondary={`$${product.totalSales.toFixed(2)} • ${product.count
                      } orders`}
                    primaryTypographyProps={{ className: "text-gray-200" }}
                    secondaryTypographyProps={{ className: "text-gray-400" }}
                  />
                </ListItem>
              ))}
              {analyticsData.topProducts.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No product data available"
                    primaryTypographyProps={{ className: "text-gray-400" }}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Reusable metric card component
const MetricCard = ({
  icon,
  title,
  value,
  color,
  isCurrency = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | null;
  color: string;
  isCurrency?: boolean;
}) => (
  <Card sx={{ backgroundColor: " #1f2937" }} className=" p-4 rounded-lg">
    <CardContent className="flex items-center space-x-4">
      <div className={`${color} p-3 rounded-full text-white`}>{icon}</div>
      <div>
        <Typography variant="subtitle1" className="text-gray-400">
          {title}
        </Typography>
        <Typography variant="h4" className="text-gray-100">
          {value !== null ? (
            isCurrency ? (
              `$${value.toFixed(2)}`
            ) : (
              value
            )
          ) : (
            <CircularProgress size={24} />
          )}
        </Typography>
      </div>
    </CardContent>
  </Card>
);

export default Analytics;
