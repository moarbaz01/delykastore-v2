import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { SpinTransaction } from "@/models/spin.transaction.model";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const spinTransaction = new SpinTransaction(body);
    const savedTransaction = await spinTransaction.save();

    return NextResponse.json({
      success: true,
      data: savedTransaction,
      message: "SpinTransaction created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const transactions = await SpinTransaction.find()
      .populate("productId")
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
