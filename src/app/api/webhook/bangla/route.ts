import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    console.log("WEBHOOK RESPONSE GOT", body);
    const { status, uid, trx, orderid } = body;

    // 1️⃣ Basic payload validation
    if (!status || !uid || !trx || !orderid) {
      return NextResponse.json(
        { message: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    // 2️⃣ Find order
    const order = await Order.findOne({ transactionId: orderid });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 3️⃣ Validate player ID
    if (uid !== order.gameCredentials?.userId) {
      return NextResponse.json({ message: "UID mismatch" }, { status: 400 });
    }

    // 4️⃣ Idempotency check (webhooks can retry)
    if (order.status === "success" || order.status === "failed") {
      return NextResponse.json(
        { message: "Webhook already processed" },
        { status: 200 }
      );
    }

    // 5️⃣ Process result
    if (status === "success") {
      order.status = "success";
      order.apiTransactionId = trx; // optional but recommended
    } else {
      order.status = "failed";
    }

    await order.save();

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bangla API Webhook Error:", error);

    // Webhooks should usually return 200 to prevent retries
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 200 }
    );
  }
}
