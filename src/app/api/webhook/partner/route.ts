import { NextResponse } from "next/server";
import { Order } from "@/models/order.model";
import { dbConnect } from "@/lib/database";
import crypto from "crypto";
import { createOrderLog } from "@/utils/orderLogs";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("X-Webhook-Timestamp");
    const signature = req.headers.get("X-Webhook-Signature");
    const secret = process.env.ALUU_SECRET_KEY;

    if (!timestamp || !signature || !secret) {
      return NextResponse.json({ success: false, message: "Missing headers or secret" }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - Number(timestamp)) > 300) {
      return NextResponse.json({ success: false, message: "Stale webhook timestamp" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    const ok = crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(String(signature || ""), "utf8")
    );

    if (!ok) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const partner_orderid = body?.data?.orderid;
    const status = body?.data?.status;

    if (!partner_orderid) {
      return NextResponse.json({ success: false, message: "Missing orderid in payload" }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findOne({ transactionId: partner_orderid });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Update order based on status from API
    let mappedStatus = order.status;
    if (status === "successful") {
      mappedStatus = "success";
    } else if (status === "failed") {
      mappedStatus = "failed";
      order.failureReason = "Failed at provider";
    }

    if (mappedStatus !== order.status) {
      order.status = mappedStatus;
      await order.save();

      // Log the update
      await createOrderLog({
        transactionId: partner_orderid,
        orderId: order._id?.toString(),
        provider: "Partner API",
        requestPayload: { partner_orderid },
        responsePayload: body,
        status: mappedStatus === "success" ? "success" : "failed",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
