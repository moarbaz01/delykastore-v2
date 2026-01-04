import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { SpinTransaction } from "@/models/spin.transaction.model";
import { getToken } from "next-auth/jwt";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { spinId, status } = await req.json();

    if (!spinId || !status) {
      return NextResponse.json(
        { error: "Spin ID and status are required" },
        { status: 400 }
      );
    }

    if (!["success", "reject", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'success', 'reject', or 'pending'" },
        { status: 400 }
      );
    }

    const updatedSpin = await SpinTransaction.findByIdAndUpdate(
      spinId,
      { status },
      { new: true }
    );

    if (!updatedSpin) {
      return NextResponse.json(
        { error: "Spin transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Status updated successfully",
      spin: updatedSpin,
    });
  } catch (error) {
    console.error("Update spin status error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
