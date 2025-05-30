import { NextResponse } from "next/server";
import { Coupon } from "@/models/coupon.model";
import { dbConnect } from "@/lib/database";

interface RequestBody {
  coupon: string;
  costId: string;
  price: number;
  productId: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body: RequestBody = await req.json();
    const { coupon, costId, price, productId } = body;

    // Validate required fields
    if (!coupon || !costId == null || price == null || !productId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate price is positive number
    if (price <= 0) {
      return NextResponse.json(
        { message: "Invalid price amount" },
        { status: 400 }
      );
    }

    const couponData = await Coupon.findOne({ coupon });
    if (!couponData) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!couponData.isActive) {
      return NextResponse.json(
        { message: "Coupon is not active" },
        { status: 400 }
      );
    }

    // Check expiry date
    if (new Date(couponData.expiry) < new Date()) {
      return NextResponse.json(
        { message: "Coupon has expired" },
        { status: 400 }
      );
    }

    // Check usage limits
    if (couponData.limit && couponData.timesUsed >= couponData.limit) {
      return NextResponse.json(
        { message: "Coupon usage limit exceeded" },
        { status: 400 }
      );
    }

    // Check if coupon applies to this product (single product comparison)
    if (couponData.selectedProducts.toString() !== productId) {
      return NextResponse.json(
        { message: "Coupon not valid for this product" },
        { status: 400 }
      );
    }

    // Check minimum amount
    if (couponData.minAmount > price) {
      return NextResponse.json(
        {
          message: `Minimum purchase amount of $${couponData.minAmount} required`,
        },
        { status: 400 }
      );
    }

    // Check if cost is valid (assuming selectedCosts is an array)
    const costValid = couponData.selectedCosts.includes(costId);
    if (!costValid) {
      return NextResponse.json(
        { message: "Coupon not valid for this purchase option" },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (couponData.type === "percentage") {
      discountAmount = price * (couponData.discount / 100);
      if (couponData.maxDiscount) {
        discountAmount = Math.min(discountAmount, couponData.maxDiscount);
      }
    } else {
      discountAmount = couponData.discount;
    }

    // Ensure discount doesn't make price negative
    const finalPrice = Math.max(price - discountAmount, 0).toFixed(2);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon applied successfully",
        discount: discountAmount,
        finalPrice,
        couponDetails: {
          code: couponData.coupon,
          type: couponData.type,
          discountValue: couponData.discount,
          maxDiscount: couponData.maxDiscount || null,
          minAmount: couponData.minAmount || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
