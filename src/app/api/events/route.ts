import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { dbConnect } from "@/lib/database";
import { Event } from "@/models/event.model";

export async function GET() {
  try {
    await dbConnect();
    const events = await Event.find().populate("productId").lean();
    return NextResponse.json({ success: true, data: events }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId, costId } = await req.json();

    if (!productId || !costId) {
      return NextResponse.json(
        { success: false, message: "productId and costId are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Check if event already exists
    const existingEvent = await Event.findOne({ costId });
    if (existingEvent) {
      return NextResponse.json(
        { success: false, message: "This cost item is already an active event." },
        { status: 400 }
      );
    }

    const event = await Event.create({ productId, costId });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
