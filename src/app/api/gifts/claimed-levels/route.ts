import { dbConnect } from "@/lib/database";
import { GiftTransaction } from "@/models/gift.transaction.model";
import { NextRequest, NextResponse } from "next/server";

// GET: Check claimed levels for a user and product
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "userId and productId are required" },
        { status: 400 },
      );
    }

    // Fetch only successful transactions with minimal fields
    const claimedTransactions = await GiftTransaction.find({
      userId,
      productId,
    })
      .select("level") // Only select the level field
      .lean();

    // Extract unique levels
    const claimedLevels = claimedTransactions
      .map((t: any) => t.level)
      .filter((level: any) => level !== undefined && level !== null)
      .map((level: any) => Number(level));

    return NextResponse.json({
      success: true,
      claimedLevels: [...new Set(claimedLevels)], // Remove duplicates
    });
  } catch (error) {
    console.error("Error checking claimed levels:", error);
    return NextResponse.json(
      { error: "Failed to check claimed levels" },
      { status: 500 },
    );
  }
}
