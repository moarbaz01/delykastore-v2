import { dbConnect } from "@/lib/database";
import { Coupon } from "@/models/coupon.model";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const body = await req.json();
    const {
      coupon,
      discount,
      minAmount,
      startDate,
      expiry,
      selectedProducts,
      selectedCosts,
      limit,
      isActive,
      maxDiscount,
      type,
    } = body;

    console.log("body", body);

    if (
      !coupon ||
      !discount ||
      !minAmount ||
      !startDate ||
      !expiry ||
      !selectedProducts ||
      !limit ||
      !isActive ||
      !type ||
      !selectedCosts
    ) {
      return NextResponse.json(
        {
          message: "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    const couponExist = await Coupon.findOne({ coupon });
    if (couponExist) {
      return NextResponse.json(
        {
          message: "Coupon already exists",
        },
        {
          status: 400,
        }
      );
    }

    const newCoupon = new Coupon({
      coupon,
      discount,
      minAmount,
      maxDiscount,
      startDate,
      expiry,
      selectedProducts,
      selectedCosts,
      limit,
      isActive,
      type,
    });

    await newCoupon.save();
    return NextResponse.json(
      {
        message: "Coupon created successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const {
      coupon,
      discount,
      minAmount,
      startDate,
      expiry,
      selectedProducts,
      selectedCosts,
      isActive,
      maxDiscount,
      type,
      limit,
    } = await req.json();
    console.log("type", type);

    const myCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        coupon,
        discount,
        minAmount,
        startDate,
        maxDiscount,
        expiry,
        selectedProducts,
        selectedCosts,
        isActive,
        type,
        limit,
      },
      {
        new: true,
      }
    );
    console.log("myCoupon", myCoupon);

    if (!myCoupon) {
      return NextResponse.json(
        {
          message: "Coupon not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Coupon updated successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return NextResponse.json(
          {
            message: "Coupon not found",
          },
          {
            status: 404,
          }
        );
      }
      return NextResponse.json(
        {
          message: "Coupon found",
          coupon,
        },
        {
          status: 200,
        }
      );
    }

    const coupons = await Coupon.find();
    if (!coupons) {
      return NextResponse.json(
        {
          message: "Coupons not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Coupons Fetched Succesfully",
        coupons,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json(
        {
          message: "Coupon not found",
        },
        {
          status: 404,
        }
      );
    }
    return NextResponse.json(
      {
        message: "Coupon deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
