import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { User } from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { z } from "zod";
import bcrypt from "bcrypt";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = changePasswordSchema.parse(body);

    const user = await User.findById(session.user.id).select("+password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // For Telegram users who might not have a password yet
    if (user.authProvider === "telegram" && !user.password) {
        // Allow setting password for the first time without currentPassword check
        // But the schema requires currentPassword. 
        // For simplicity, let's just require it or handle telegram separately.
    }

    if (user.password) {
        const isValidPassword = await bcrypt.compare(parsedData.currentPassword, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { message: "Invalid current password" },
                { status: 400 }
            );
        }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parsedData.newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error("Password update error:", error.message);
    return NextResponse.json({ message: "Failed to update password" }, { status: 500 });
  }
}
