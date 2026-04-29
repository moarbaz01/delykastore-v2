import { Order } from "@/models/order.model";
import { OrderLog } from "@/models/orderlog.model";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const { status, uid, trx, orderid } = body;

    // 1️⃣ Basic payload validation
    if (!status || !uid || !trx || !orderid) {
      await OrderLog.create({
        transactionId: orderid || "unknown",
        provider: "bangla",
        requestPayload: body,
        status: "failed",
        errorMessage: "Invalid webhook payload — missing required fields",
      });
      return NextResponse.json(
        { message: "Invalid webhook payload" },
        { status: 400 },
      );
    }

    // 2️⃣ Find order
    const order = await Order.findOne({ transactionId: orderid });
    if (!order) {
      await OrderLog.create({
        transactionId: orderid,
        provider: "bangla",
        requestPayload: body,
        status: "failed",
        errorMessage: `Order not found for transactionId: ${orderid}`,
      });
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 3️⃣ Validate player ID
    if (uid !== order.gameCredentials?.userId) {
      await OrderLog.create({
        transactionId: orderid,
        orderId: order._id,
        provider: "bangla",
        requestPayload: body,
        status: "failed",
        errorMessage: `UID mismatch — expected ${order.gameCredentials?.userId}, got ${uid}`,
      });
      return NextResponse.json({ message: "UID mismatch" }, { status: 400 });
    }

    // 4️⃣ Idempotency check (webhooks can retry)
    if (order.status === "success" || order.status === "failed") {
      return NextResponse.json(
        { message: "Webhook already processed" },
        { status: 200 },
      );
    }

    // 5️⃣ Process result
    if (status === "success") {
      order.status = "success";
    } else {
      order.status = "failed";
      order.failureReason = `Bangla API webhook failed. Provider trx: ${trx}`;
    }

    await order.save();

    // 6️⃣ Save log
    await OrderLog.create({
      transactionId: orderid,
      orderId: order._id,
      provider: "bangla",
      requestPayload: body,
      responsePayload: { providerTrx: trx, finalStatus: status },
      status: status === "success" ? "success" : "failed",
      errorMessage:
        status !== "success" ? `Bangla webhook status: ${status}` : undefined,
    });

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    // Return 200 to prevent infinite retries
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 200 },
    );
  }
}
