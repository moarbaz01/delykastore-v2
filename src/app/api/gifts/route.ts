export const dynamic = "force-dynamic";

import { dbConnect } from "@/lib/database";
import { Gift } from "@/models/gift.model";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/* -------------------- ZOD SCHEMA -------------------- */
const giftSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  bannerText: z.string().optional(),
  wageringLevels: z.array(
    z.object({
      level: z.number(),
      wagering: z.number(),
      costIds: z.array(z.string()),
    }),
  ),

  startDate: z.string().optional(),
  endDate: z.string().optional(),
  features: z
    .array(
      z.object({
        title: z.string().min(1, "Feature title is required"),
        value: z.string().min(1, "Feature value is required"),
      }),
    )
    .optional(),
  isActive: z.boolean().optional(),
});

/* -------------------- POST -------------------- */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = giftSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.errors },
        { status: 400 },
      );
    }

    const data = result.data;

    const gift = await Gift.create({
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });

    return NextResponse.json(gift, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create gift" },
      { status: 400 },
    );
  }
}

/* -------------------- GET -------------------- */
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const productId = searchParams.get("productId");

    if (id) {
      const gift = await Gift.findById(id).populate("productId", "name").lean();

      if (!gift) {
        return NextResponse.json(
          { error: "Gift not found", isActive: false },
          { status: 404 },
        );
      }

      return NextResponse.json(gift);
    }

    if (productId) {
      const gifts = await Gift.find({
        productId,
        isActive: true,
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: new Date() } },
        ],
        $and: [
          {
            $or: [
              { endDate: { $exists: false } },
              { endDate: { $gte: new Date() } },
            ],
          },
        ],
      })
        .populate("productId", "name")
        .lean();

      return NextResponse.json(gifts);
    }

    const gifts = await Gift.find({})
      .populate("productId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(gifts);
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve gifts" },
      { status: 500 },
    );
  }
}

/* -------------------- PUT -------------------- */
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gift ID required" }, { status: 400 });
    }

    const body = await req.json();
    const result = giftSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.errors },
        { status: 400 },
      );
    }

    const data = result.data;

    const updateData: any = {
      productId: data.productId,
      bannerText: data.bannerText,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      wageringLevels: data.wageringLevels,
      features: data.features,
      isActive: data.isActive,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedGift = await Gift.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("productId", "name");

    if (!updatedGift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    return NextResponse.json(updatedGift);
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update gift" },
      { status: 400 },
    );
  }
}

/* -------------------- DELETE -------------------- */
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gift ID required" }, { status: 400 });
    }

    const gift = await Gift.findByIdAndDelete(id);

    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Gift deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
