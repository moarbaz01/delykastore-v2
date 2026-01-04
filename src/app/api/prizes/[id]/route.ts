import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import Prize from "@/models/prize.schema";
import { getToken } from "next-auth/jwt";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = params;

    const prize = await Prize.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!prize) {
      return NextResponse.json({ error: "Prize not found" }, { status: 404 });
    }

    return NextResponse.json(prize);
  } catch (error) {
    console.error("Error updating prize:", error);
    return NextResponse.json(
      { error: "Failed to update prize" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const prize = await Prize.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!prize) {
      return NextResponse.json({ error: "Prize not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Prize deleted successfully" });
  } catch (error) {
    console.error("Error deleting prize:", error);
    return NextResponse.json(
      { error: "Failed to delete prize" },
      { status: 500 }
    );
  }
}
