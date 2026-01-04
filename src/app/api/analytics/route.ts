export const dynamic = "force-dynamic";
// dynamic component

import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";
import { Product } from "@/models/product.model";
import { User } from "@/models/user.model";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fix: Use cloned date instances
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    // Basic counts
    const [orders, products, customers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments(),
    ]);

    // Revenue calculations
    const revenueData = await Order.aggregate([
      {
        $match: { status: "success" },
      },
      {
        $addFields: {
          convertedAmount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "string"] },
              { $toDouble: { $trim: { input: "$amount" } } },
              "$amount",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$convertedAmount" },
          todayIncome: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", todayStart] },
                "$convertedAmount",
                0,
              ],
            },
          },
          monthlyIncome: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", monthStart] },
                    { $lt: ["$createdAt", nextMonthStart] },
                  ],
                },
                "$convertedAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    // Weekly sales data
    const weeklySales = await Order.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: oneWeekAgo, $lt: now },
        },
      },
      {
        $addFields: {
          convertedAmount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "string"] },
              { $toDouble: { $trim: { input: "$amount" } } },
              "$amount",
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$convertedAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly sales data
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: sixMonthsAgo, $lt: now },
        },
      },
      {
        $addFields: {
          convertedAmount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "string"] },
              { $toDouble: { $trim: { input: "$amount" } } },
              "$amount",
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$convertedAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const topProducts = await Order.aggregate([
      {
        $match: { status: "success" },
      },
      {
        $addFields: {
          convertedAmount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "string"] },
              { $toDouble: { $trim: { input: "$amount" } } },
              "$amount",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$product",
          totalSales: { $sum: "$convertedAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
    ]);

    const revenue = revenueData[0]?.total || 0;
    const todaysIncome = revenueData[0]?.todayIncome || 0;
    const monthlyIncome = revenueData[0]?.monthlyIncome || 0;

    const data = {
      orders,
      products,
      customers,
      revenue,
      todaysIncome,
      monthlyIncome,
      weeklySales,
      monthlySales,
      topProducts,
      orderStatusCounts,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { message: "Failed to fetch analytics", error: error.message },
      { status: 500 }
    );
  }
}
