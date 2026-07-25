import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { User } from "@/models/user.model";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/utils/nodemailer";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpEmailHtml(otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #110e19; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ff962d 0%, #ff7a00 100%); padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #ffffff;">DELYKASTORE</h1>
      </div>
      <div style="padding: 32px 24px; text-align: center;">
        <h2 style="color: #ffffff; margin-bottom: 8px;">Password Reset OTP</h2>
        <p style="color: #a0a0a0; margin-bottom: 24px;">Use the code below to reset your password. This code expires in 10 minutes.</p>
        <div style="background: #252F45; border-radius: 8px; padding: 20px; margin: 0 auto; display: inline-block;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ff962d;">${otp}</span>
        </div>
        <p style="color: #a0a0a0; margin-top: 24px; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div style="background: #252F45; padding: 16px; text-align: center;">
        <p style="color: #a0a0a0; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} DELYKASTORE. All rights reserved.</p>
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action } = body;

    // ───── Step 1: Send OTP ─────
    if (action === "send-otp") {
      const { email } = body;
      if (!email) {
        return NextResponse.json(
          { message: "Email is required" },
          { status: 400 },
        );
      }

      const user = await User.findOne({ email, authProvider: "email" });

      // Always return success to not leak whether the email exists
      if (!user) {
        return NextResponse.json({
          message: "If an account exists, an OTP has been sent.",
        });
      }

      const otp = generateOtp();
      const hashedOtp = await bcrypt.hash(otp, 10);

      user.resetOtp = hashedOtp;
      user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      // Send email
      await sendEmail(
        process.env.NODEMAIL_USER!,
        email,
        "DELYKASTORE - Password Reset OTP",
        getOtpEmailHtml(otp),
      );

      return NextResponse.json({
        message: "If an account exists, an OTP has been sent.",
      });
    }

    // ───── Step 2: Verify OTP ─────
    if (action === "verify-otp") {
      const { email, otp } = body;
      if (!email || !otp) {
        return NextResponse.json(
          { message: "Email and OTP are required" },
          { status: 400 },
        );
      }

      const user = await User.findOne({ email, authProvider: "email" }).select(
        "+resetOtp",
      );

      if (!user || !user.resetOtp || !user.resetOtpExpiry) {
        return NextResponse.json(
          { message: "Invalid or expired OTP" },
          { status: 400 },
        );
      }

      // Check expiry
      if (new Date() > user.resetOtpExpiry) {
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        await user.save();
        return NextResponse.json(
          { message: "OTP has expired. Please request a new one." },
          { status: 400 },
        );
      }

      // Compare OTP
      const isValid = await bcrypt.compare(otp, user.resetOtp);
      if (!isValid) {
        return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
      }

      // Generate short-lived reset token (5 min)
      const resetSecret =
        process.env.PASSWORD_RESET_SECRET || process.env.NEXTAUTH_SECRET!;
      const resetToken = jwt.sign(
        { userId: user._id.toString(), email },
        resetSecret,
        { expiresIn: "5m" },
      );

      return NextResponse.json({ message: "OTP verified", resetToken });
    }

    // ───── Step 3: Reset Password ─────
    if (action === "reset-password") {
      const { email, token, newPassword } = body;
      if (!email || !token || !newPassword) {
        return NextResponse.json(
          { message: "All fields are required" },
          { status: 400 },
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: "Password must be at least 8 characters" },
          { status: 400 },
        );
      }

      // Verify reset token
      const resetSecret =
        process.env.PASSWORD_RESET_SECRET || process.env.NEXTAUTH_SECRET!;
      let decoded: any;
      try {
        decoded = jwt.verify(token, resetSecret);
      } catch {
        return NextResponse.json(
          { message: "Reset link has expired. Please start over." },
          { status: 400 },
        );
      }

      if (decoded.email !== email) {
        return NextResponse.json(
          { message: "Invalid reset token" },
          { status: 400 },
        );
      }

      const user = await User.findOne({ email, authProvider: "email" });
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.isVerified = true; // Mark as verified since they used OTP
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save();

      return NextResponse.json({ message: "Password reset successfully. Your account is now verified." });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Forgot password error:", error.message);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
