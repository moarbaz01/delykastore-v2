import { dbConnect } from "@/lib/database";
import { CostCategory } from "@/models/costcategory.model";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (mongoose.isValidObjectId(id)) {
      const result = await CostCategory.findById(id.toString);
      if (result) {
        return NextResponse.json(result, { status: 200 });
      } else {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
    }

    const result = await CostCategory.find();
    if (!result) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }
    const isDuplicate = await CostCategory.findOne({ name });
    if (isDuplicate) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 400 }
      );
    }
    const result = await CostCategory.create({ name });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
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
    const { name } = await req.json();
    if (mongoose.isValidObjectId(id)) {
      const result = await CostCategory.findByIdAndUpdate(
        id,
        {
          name,
        },
        { new: true }
      );

      if (result) {
        return NextResponse.json(result, { status: 200 });
      } else {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ message: "Error" }, { status: 500 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
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
    if (mongoose.isValidObjectId(id)) {
      const result = await CostCategory.findByIdAndDelete(id);
      if (result) {
        return NextResponse.json(result, { status: 200 });
      } else {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
    }
    return NextResponse.json({ message: "Error" }, { status: 500 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
