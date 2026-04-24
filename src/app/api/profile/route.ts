import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { User } from "@/models/user.model";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
});

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    if (!token || !token.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(token.id).select(
      "name email role authProvider telegramId createdAt isBlocked"
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error("Profile GET error:", error.message);
    return NextResponse.json({ message: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    if (!token || !token.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = updateProfileSchema.parse(body);

    // If updating email, check it's not taken
    if (parsedData.email) {
      const existing = await User.findOne({
        email: parsedData.email,
        _id: { $ne: token.id },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Email is already in use" },
          { status: 400 }
        );
      }
    }

    const updated = await User.findByIdAndUpdate(token.id, parsedData, {
      new: true,
    }).select("name email role authProvider telegramId");

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error("Profile PUT error:", error.message);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
