import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";
import { User } from "@/models/user.model";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    if (!token || !token.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const query: any = { user: token.id };
    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    // Note: To search by product name, we might need a more complex query if product is a reference.
    // However, for now let's handle basic status filtering and allow the frontend to pass status.
    // If search is provided, we might need to populate and then filter, or use an aggregation.
    // For simplicity, let's implement status filtering first.

    const [ordersRaw, total] = await Promise.all([
      Order.find(query)
        .populate("product", "name image type")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    const now = new Date();
    const orders = ordersRaw.map((order: any) => {
      const isExpired = order.expiresAt && new Date(order.expiresAt) < now;
      if (isExpired) {
        return {
          ...order,
          accountDetails: null,
          transactionId: "EXPIRED",
        };
      }
      return order;
    });

    return NextResponse.json(
      {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Profile orders GET error:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
