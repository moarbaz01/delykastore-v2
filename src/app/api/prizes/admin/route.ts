import { dbConnect } from "@/lib/database";
import Prize from "@/models/prize.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const query: any = { isActive: true };
    if (productId) {
      query.productId = productId;
    }

    const prizes = await Prize.find(query)
      .sort({ createdAt: 1 })
      .populate("productId", "_id name");

    return NextResponse.json(prizes);
  } catch (error) {
    console.error("Error fetching prizes:", error);
    return NextResponse.json(
      { error: "Failed to fetch prizes" },
      { status: 500 }
    );
  }
}
