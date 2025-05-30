import { NextResponse } from "next/server";
import crypto from "crypto";

const API_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/transaction-list-2";

export async function GET() {
  try {
    // Generate request timestamp (UTC)
    const req_time = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14); // Format: YYYYmmddHis

    // Concatenate parameters in sorted order
    const hashString = `${req_time}${process.env.PAYWAY_MERCHANT_KEY!}`;

    // Generate hash using HMAC SHA512 and encode in Base64
    const hash = crypto
      .createHmac("sha512", process.env.PAYWAY_PUBLIC_KEY!)
      .update(hashString)
      .digest("base64");

    // Prepare the request payload
    const requestBody = {
      req_time,
      merchant_id: process.env.PAYWAY_MERCHANT_KEY!,
      hash,
    };

    // Send request to ABA PayWay API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        language: "en", // Optional
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the response
    const responseData = await response.json();

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
