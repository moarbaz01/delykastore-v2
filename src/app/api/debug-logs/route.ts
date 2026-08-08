import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const DebugLog = mongoose.models.DebugLog || mongoose.model("DebugLog", new mongoose.Schema({ data: Object }, { strict: false, timestamps: true }));
    
    // @ts-expect-error - Mongoose dynamic model typing issue
    const logs = await DebugLog.find({ event: "TELEGRAM_AUTH_FAILED" }).sort({ createdAt: -1 }).limit(5);
    
    return NextResponse.json({ logs: logs });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
