import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/database";
import { User } from "@/models/user.model";
import { OtpVerification } from "@/models/otp.model";
import bcrypt from "bcrypt";
import validate from "deep-email-validator";
import { sendEmail } from "@/utils/nodemailer";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action } = body;

    // ───── Step 1: Request OTP ─────
    if (action === "request-otp") {
      const parsedData = signupSchema.parse(body);
      const { name, email, password } = parsedData;

      // 1. Real Email Validation
      const emailRes = await validate({
        email: email,
        validateSMTP: false, // SMTP checks can be flaky/slow, rely on OTP for proof
      });
      
      if (!emailRes.valid) {
        return NextResponse.json(
          { message: "The email address provided is invalid or unreachable. Please use a real email." },
          { status: 400 }
        );
      }

      // 2. Check if user already exists
      const existingUser = await User.findOne({ email, authProvider: "email" });
      if (existingUser) {
        return NextResponse.json(
          { message: "An account with this email already exists" },
          { status: 400 }
        );
      }

      const otp = generateOtp();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Upsert into OtpVerification
      await OtpVerification.updateOne(
        { email },
        { email, name, password: hashedPassword, otp, createdAt: new Date() },
        { upsert: true }
      );

      // 3. Send OTP Email
      await sendEmail(
        process.env.NODEMAIL_USER!,
        email,
        "Welcome to DELYKASTORE - Verify Your Account",
        `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ff962d; text-align: center;">Verify Your Email</h2>
          <p>Hi ${name},</p>
          <p>Thank you for joining DELYKASTORE! Please use the following code to verify your account. This code will expire in 10 minutes.</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #252F45; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">© 2026 DELYKASTORE. All rights reserved.</p>
        </div>
        `
      );

      return NextResponse.json({ message: "Verification code sent to your email" });
    }

    // ───── Step 2: Verify OTP ─────
    if (action === "verify-otp") {
      const { email, otp } = body;
      if (!email || !otp) {
        return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
      }

      const otpEntry = await OtpVerification.findOne({ email });
      if (!otpEntry) {
        return NextResponse.json({ message: "OTP has expired or was not requested. Please request a new one." }, { status: 400 });
      }

      if (otpEntry.otp !== otp) {
        return NextResponse.json({ message: "Invalid verification code" }, { status: 400 });
      }

      // Check if user somehow exists already
      const existingUser = await User.findOne({ email, authProvider: "email" });
      if (existingUser) {
        return NextResponse.json({ message: "Account is already verified" }, { status: 400 });
      }

      // Finalize Verification: Create the verified user
      await User.create({
        name: otpEntry.name,
        email: otpEntry.email,
        password: otpEntry.password,
        isVerified: true,
        role: "user",
        authProvider: "email",
      });

      // Cleanup OTP
      await OtpVerification.deleteOne({ email });

      return NextResponse.json({ message: "Account verified successfully! You can now log in." });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Signup error:", error.message);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

