import { Order } from "@/models/order.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!id || !productId) {
      return NextResponse.json(
        { error: "User ID and Product ID required" },
        { status: 400 },
      );
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const result = await Order.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $trim: { input: "$gameCredentials.userId" } }, id.trim()],
          },
          status: "success",
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
          product: productObjectId,
        },
      },
      {
        $group: {
          _id: null,
          totalWagered: {
            $sum: {
              $toDouble: "$amount", // 🔥 convert string → number
            },
          },
        },
      },
    ]);

    console.log("Result", result);

    const totalWagered = result[0]?.totalWagered || 0;

    return NextResponse.json({
      userId: id,
      totalWagered,
    });
  } catch (error) {
    console.error("Error fetching wagering data:", error);
    return NextResponse.json(
      { error: "Failed to fetch wagering data" },
      { status: 500 },
    );
  }
}
