import { NextResponse, NextRequest } from "next/server";
import { Order } from "@/models/order.model";
import { dbConnect } from "@/lib/database";
import { POST as processPayment } from "@/app/api/payment/pay/route";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    let responseBase64 = "";
    
    // Parse form-data or json
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      responseBase64 = formData.get("response") as string;
    } else {
       const body = await req.json();
       responseBase64 = body.response;
    }
    
    if (!responseBase64) {
      return NextResponse.json({ message: "No response field" }, { status: 400 });
    }
    
    // Decode base64
    const decodedStr = Buffer.from(responseBase64, "base64").toString("utf-8");
    const data = JSON.parse(decodedStr);
    
    const { status, tran_id, apv } = data;
    
    const order = await Order.findOne({ transactionId: tran_id });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    
    if (order.status === "success") {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }
    
    // Forward to internal /payment/pay function
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://winwintopup.com/api";
    const payUrl = `${baseUrl}/payment/pay?orderId=${order._id.toString()}`;
    
    const fakeReq = new NextRequest(payUrl, {
      method: "POST",
      body: JSON.stringify({ status, tran_id, apv }),
      headers: { "Content-Type": "application/json" }
    });
    
    // Execute the main payment processing logic
    const result = await processPayment(fakeReq as any);
    
    return result;
  } catch (error: any) {
    console.error("ABA Webhook Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
