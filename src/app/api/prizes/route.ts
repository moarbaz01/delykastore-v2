import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import Prize from "@/models/prize.schema";
import { getToken } from "next-auth/jwt";
import { Product } from "@/models/product.model";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.spinActive) {
      return NextResponse.json(
        { success: false, error: "Spin is not active for this product" },
        { status: 400 }
      );
    }

    const query: any = { isActive: true };
    if (productId) {
      query.productId = productId;
    }

    const prizes = await Prize.find(query)
      .sort({ createdAt: 1 })
      .populate("productId", "_id name");

    let mappedPrizes = prizes;
    if (prizes.length > 0) {
      mappedPrizes = prizes.map((prize: any) => ({
        id: prize.id,
        name: prize.name,
        color: prize.color,
        winRate: prize.winRate,
        weight: prize.weight,
        limit: prize.limit,
      }));
    }

    return NextResponse.json(mappedPrizes);
  } catch (error) {
    console.error("Error fetching prizes:", error);
    return NextResponse.json(
      { error: "Failed to fetch prizes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();

    const prize = new Prize(body);
    await prize.save();
    await prize.populate("productId", "name");

    return NextResponse.json(prize, { status: 201 });
  } catch (error) {
    console.error("Error creating prize:", error);
    return NextResponse.json(
      { error: "Failed to create prize" },
      { status: 500 }
    );
  }
}
