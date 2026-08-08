import mongoose, { Document, Model } from "mongoose";

export interface IOtp extends Document {
  email: string;
  name: string;
  password?: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new mongoose.Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Document will automatically delete 10 minutes (600s) after creation
    },
  },
  { timestamps: true }
);

export const OtpVerification =
  (mongoose.models.OtpVerification as Model<IOtp>) || mongoose.model<IOtp>("OtpVerification", otpSchema);
