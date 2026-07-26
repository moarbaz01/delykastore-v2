import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";
import { User } from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const query: any = { user: session.user.id };
    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    } else {
      query.status = { $ne: "pending" };
    }

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
