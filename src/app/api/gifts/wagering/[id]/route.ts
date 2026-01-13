import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    const result = await Order.aggregate([
      {
        $match: {
          "gameCredentials.userId": id,
          status: "success",
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
