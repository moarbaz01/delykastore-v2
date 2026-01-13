import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const zoneId = searchParams.get("zoneId");
    const serverId = searchParams.get("serverId");
    const email = searchParams.get("email");

    // Build flexible query - accept any available user identifier
    const query: any = { status: "success" }; // Only successful orders

    // Add user identifiers if available
    if (userId) query.userId = userId;
    if (zoneId) query.zoneId = zoneId;
    if (serverId) query.serverId = serverId;
    if (email) query.email = email;

    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Add date range to query
    query.createdAt = {
      $gte: startOfMonth,
      $lte: endOfMonth,
    };

    // Calculate total successful topups for current month
    const monthlyWagering = await Order.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalWagering =
      monthlyWagering.length > 0 ? monthlyWagering[0].totalAmount : 0;

    return NextResponse.json(
      {
        monthlyWagering: totalWagering,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching user wagering:", error);
    return NextResponse.json(
      { error: "Failed to fetch wagering data" },
      { status: 500 },
    );
  }
}
