import { dbConnect } from "@/lib/database";
import { Coupon } from "@/models/coupon.model";
import { Order } from "@/models/order.model";
import { Product } from "@/models/product.model";
import { Account } from "@/models/account.model";
import { decryptData } from "@/utils/encryption";
import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const { payload } = await req.json();
    let orderParams;
    try {
      orderParams = decryptData(payload);
    } catch (error) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const {
      // Product Data
      name,
      productId,
      costId,
      orderDetails,
      orderType,
      region,
      userId,
      zoneId,
      game,
      couponCode,
      isCouponApplied,
      user,
    } = orderParams;

    const isValidProduct = await Product.findById(productId);
    if (!isValidProduct) {
      return NextResponse.json({ message: "Invalid Product" }, { status: 400 });
    }

    if (isValidProduct.type === "account" && !token) {
      return NextResponse.json(
        { message: "Please login to buy account products" },
        { status: 401 },
      );
    }

    // For account orders, always use the server-side token ID as the user.
    // Never trust the user ID from the client payload.
    const resolvedUser = isValidProduct.type === "account" ? token?.id : user;

    const isValidCost = isValidProduct?.cost?.find((cost) => {
      return cost.id === costId;
    });

    if (!isValidCost || !isValidCost.price) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    // Is valid coupon
    let couponDetails = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ coupon: couponCode });
      if (!coupon) {
        return NextResponse.json(
          { message: "Invalid Coupon Code" },
          { status: 400 },
        );
      }
      couponDetails = {
        code: coupon.coupon,
        type: coupon.type,
        discountValue: coupon.discount,
      };
    }

    const req_time = Math.floor(Date.now() / 1000).toString();
    const tran_id = "TXN" + req_time; // Unique transaction ID

    const basePrice = parseFloat(isValidCost.price);
    let afterDiscountAmount = basePrice;

    if (isCouponApplied && couponDetails) {
      if (couponDetails.type === "percentage") {
        const discountAmount = (basePrice * couponDetails.discountValue) / 100;
        afterDiscountAmount = basePrice - discountAmount;
      } else if (couponDetails.type === "flat") {
        const discountAmount = couponDetails.discountValue;
        afterDiscountAmount = basePrice - discountAmount;
      }
    }

    const order = new Order({
      orderDetails,
      orderType,
      region,
      gameCredentials: { userId, zoneId, game },
      transactionId: tran_id,
      product: productId,
      amount: afterDiscountAmount,
      costId,
      method: "abapay",
      status: "pending",
      couponCode,
      isCouponApplied,
      couponDetails,
      user: resolvedUser,
    });

    // Reserve Account if product type is account
    if (isValidProduct.type === "account") {
      // ── Stock check BEFORE creating order or charging user ──
      const availableAccount = await Account.findOne({
        productId: productId,
        costId: costId,
        isActive: true,
        $or: [{ isReserved: false }, { reservedExpiry: { $lt: new Date() } }],
      });

      if (!availableAccount) {
        return NextResponse.json(
          { message: "This package is currently out of stock" },
          { status: 400 },
        );
      }

      // Reserve the account for 15 minutes
      availableAccount.isReserved = true;
      availableAccount.reservedExpiry = new Date(Date.now() + 15 * 60 * 1000);
      await availableAccount.save();

      order.account = availableAccount._id;
    }

    await order.save();

    // Ensure required environment variables are set
    const merchant_id = process.env.PAYWAY_MERCHANT_KEY!;
    const secret_key = process.env.PAYWAY_PUBLIC_KEY!;

    // Generate request timestamp

    const roundedAmount = Math.round(afterDiscountAmount * 100) / 100;

    const return_url = `${process.env
      .NEXT_PUBLIC_API_URL!}/payment/pay?orderId=${order._id.toString()}`;
    const encodedReturnUrl = Buffer.from(return_url).toString("base64");
    const continue_success_url = `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/success?${new URLSearchParams({
      transactionId: tran_id,
      message: "Successfully Purchased",
      price: roundedAmount.toFixed(2),
      gameName: name,
      productId: productId,
      pack: orderDetails,
      // Only include game-specific fields for non-account orders
      ...(isValidProduct.type !== "account" && zoneId && { zoneId }),
      ...(isValidProduct.type !== "account" && userId && { userId }),
    }).toString()}`;
    const cancel_url = `${process.env
      .NEXT_PUBLIC_BASE_URL!}/failed?message=Purchase+Failed`;

    // Define all parameters in the correct order
    const params = {
      req_time,
      merchant_id,
      tran_id,
      amount: afterDiscountAmount,
      items: "",
      shipping: "0",
      ctid: "",
      pwt: "",
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      type: "purchase",
      payment_option: "abapay_khqr",
      return_url: encodedReturnUrl || "",
      cancel_url: cancel_url || "",
      continue_success_url: continue_success_url || "",
      return_deeplink: "",
      currency: "USD",
      custom_fields: "",
      return_params: "",
      payout: "",
      lifetime: "",
      additional_params: "",
      google_pay_token: "",
    };

    // Create the hash string in the correct order
    const hashString = Object.values(params).join("");
    console.log("Hash String:", hashString);

    // Compute the hash using HMAC SHA512
    const hash = createHmac("sha512", secret_key)
      .update(hashString)
      .digest("base64");

    // Return the payment data
    return NextResponse.json(
      {
        ...params,
        hash,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Error creating payment" },
      { status: 500 },
    );
  }
}
