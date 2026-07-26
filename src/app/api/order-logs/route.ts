import { dbConnect } from "@/lib/database";
import { OrderLog } from "@/models/orderlog.model";
import "@/models/order.model"; // required for populate("orderId") to work
import "@/models/product.model"; // orders reference products
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const search = searchParams.get("search") || ""; // Search by transactionId or provider
    const status = searchParams.get("status") || "";

    const query: any = {};

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { provider: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      OrderLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("orderId", "amount orderDetails createdAt status"),
      OrderLog.countDocuments(query),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("GET OrderLogs Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve order logs" },
      { status: 500 }
    );
  }
}
