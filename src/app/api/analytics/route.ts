export const dynamic = "force-dynamic";

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

    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get("range") || "all_time";

    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = new Date(now);

    switch (range) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "this_week":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Sunday start
        startDate.setHours(0, 0, 0, 0);
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "all_time":
      default:
        startDate = null;
        endDate = null;
        break;
    }

    const dateMatch = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};

    // Standard fixed bounds for original metrics (Today's Income / Monthly Income in top cards)
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
      Order.countDocuments(dateMatch),
      Product.countDocuments({ isDeleted: { $ne: true }, ...dateMatch }),
      User.countDocuments(dateMatch),
    ]);

    // Revenue calculations
    const revenueData = await Order.aggregate([
      {
        $match: { status: "success", ...dateMatch },
      },
      {
        $addFields: {
          convertedAmount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "string"] },
              { $toDouble: { $trim: { input: "$amount", chars: " $" } } },
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

    const weeklySalesMatch = range === "all_time" 
      ? { status: "success", createdAt: { $gte: oneWeekAgo, $lt: now } }
      : { status: "success", ...dateMatch };

    // Weekly sales data
    const weeklySales = await Order.aggregate([
      {
        $match: weeklySalesMatch,
      },
      {
        $addFields: {
          convertedAmount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "string"] },
              { $toDouble: { $trim: { input: "$amount", chars: " $" } } },
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

    const monthlySalesMatch = range === "all_time" 
      ? { status: "success", createdAt: { $gte: sixMonthsAgo, $lt: now } }
      : { status: "success", ...dateMatch };

    // Monthly sales data
    const monthlySales = await Order.aggregate([
      {
        $match: monthlySalesMatch,
      },
      {
        $addFields: {
          convertedAmount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "string"] },
              { $toDouble: { $trim: { input: "$amount", chars: " $" } } },
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
        $match: dateMatch
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const topProducts = await Order.aggregate([
      {
        $match: { status: "success", ...dateMatch },
      },
      {
        $addFields: {
          convertedAmount: {
            $cond: [
              { $eq: [{ $type: "$amount" }, "string"] },
              { $toDouble: { $trim: { input: "$amount", chars: " $" } } },
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
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { message: "Failed to fetch analytics", error: error.message },
      { status: 500 },
    );
  }
}
