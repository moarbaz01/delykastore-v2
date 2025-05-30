import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/database";
import { User } from "@/models/user.model";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcrypt";
// Zod schemas for request validation
const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["user", "admin"]).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  role: z.enum(["user", "admin"]).optional(),
  isBlocked: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .optional(),
});

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Parse query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(user, { status: 200 });
    }

    const users = await User.find();
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching users:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch users", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const parsedData = createUserSchema.parse(body);
    const existingUser = await User.findOne({ email: parsedData.email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    parsedData.password = await bcrypt.hash(parsedData.password, 10);

    const newUser = await User.create(parsedData);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating user:", error.message);
    return NextResponse.json(
      { message: "Failed to create user", error: error.message },
      { status: 500 }
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

    const url = new URL(req.url);
    const userId = url.searchParams.get("id");
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsedData = updateUserSchema.parse(body);

    if (parsedData.password) {
      parsedData.password = await bcrypt.hash(parsedData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, parsedData, {
      new: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating user:", error.message);
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 }
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

    if (token?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("id");
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting user:", error.message);
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message },
      { status: 500 }
    );
  }
}
