import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import Prize from "@/models/prize.schema";
import { Product } from "@/models/product.model";
import { Order } from "@/models/order.model";
import { SpinTransaction } from "@/models/spin.transaction.model";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Validate order
    const order = await Order.findOne({ transactionId });
    if (!order) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    // 2️⃣ LOCK spin (atomic)
    const spinTransaction = await SpinTransaction.findOneAndUpdate(
      { transactionId, isUsed: false },
      { isUsed: true },
      { new: true }
    );

    if (!spinTransaction) {
      return NextResponse.json(
        { error: "Spin already used or invalid" },
        { status: 400 }
      );
    }

    // 3️⃣ Validate product
    const product = await Product.findById(spinTransaction.productId);
    if (!product || !product.spinActive) {
      return NextResponse.json(
        { error: "Spin not available for this product" },
        { status: 400 }
      );
    }

    // 4️⃣ Get active prizes
    const prizes = await Prize.find({
      productId: product._id,
      isActive: true,
      limit: { $gt: 0 },
    });

    if (!prizes.length) {
      return NextResponse.json(
        { error: "No prizes available" },
        { status: 400 }
      );
    }

    // 5️⃣ Sort prizes by weight (DESC)
    const sortedPrizes = [...prizes].sort((a, b) => b.weight - a.weight);

    const highestPrize = sortedPrizes[0];
    const secondHighestPrize = sortedPrizes[1] ?? null;

    // 6️⃣ Build spin pool
    const spinPool = secondHighestPrize
      ? [highestPrize, secondHighestPrize]
      : [highestPrize];

    // 7️⃣ Weighted random selection
    const totalWeight = spinPool.reduce((sum, p) => sum + p.weight, 0);

    let r = Math.random() * totalWeight;
    let selectedPrize;

    for (const prize of spinPool) {
      r -= prize.weight;
      if (r <= 0) {
        selectedPrize = prize;
        break;
      }
    }

    if (!selectedPrize) {
      return NextResponse.json(
        { error: "Prize selection failed" },
        { status: 500 }
      );
    }

    // 8️⃣ Decrement prize limit if win (not Better Luck)
    if (selectedPrize.name !== "Better Luck") {
      await Prize.findOneAndUpdate(
        { _id: selectedPrize._id, limit: { $gt: 0 } },
        { $inc: { limit: -1 } }
      );
    }

    // 9️⃣ Lock spin transaction (IMPORTANT)
    await SpinTransaction.findOneAndUpdate(
      { _id: spinTransaction._id },
      {
        isUsed: true,
        prize: selectedPrize.name,
        status:
          highestPrize.weight === selectedPrize.weight ? "success" : "pending",
      }
    );

    // 🔟 Return prize to frontend
    return NextResponse.json({
      prize: {
        id: selectedPrize._id,
        name: selectedPrize.name,
        color: selectedPrize.color,
      },
    });
    // 7️⃣ Save result in spin transaction
    // spinTransaction.prize = selectedPrize.name;
    // spinTransaction.status =
    //   selectedPrize.name === "Better luck next time" ? "reject" : "success";

    // await spinTransaction.save();
  } catch (error) {
    console.error("Spin error:", error);
    return NextResponse.json(
      { error: "Failed to process spin" },
      { status: 500 }
    );
  }
}

export const GET = async (req: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const spinTransaction = await SpinTransaction.findOne({
      transactionId,
    });

    if (!spinTransaction) {
      return NextResponse.json(
        { error: "Spin transaction not found" },
        { status: 404 }
      );
    }

    if (spinTransaction.isUsed) {
      return NextResponse.json({
        spins: 0,
      });
    }

    return NextResponse.json({
      spins: 1,
    });
  } catch (error) {
    console.error("Spin error:", error);
    return NextResponse.json(
      { error: "Failed to process spin" },
      { status: 500 }
    );
  }
};
