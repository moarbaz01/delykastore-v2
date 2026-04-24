import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICoupon extends Document {
  coupon: string;
  discount: number;
  type: "flat" | "percentage";
  maxDiscount?: number;
  minAmount: number;
  startDate: Date;
  expiry: Date;
  isActive: boolean;
  limit: number;
  selectedProducts?: mongoose.Types.ObjectId;
  timesUsed: number;
  selectedCosts: string[];
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    coupon: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["flat", "percentage"],
      default: "flat",
    },
    maxDiscount: {
      type: Number,
    },
    minAmount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiry: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    limit: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    selectedProducts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    timesUsed: {
      type: Number,
      default: 0,
    },

    selectedCosts: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

export const Coupon =
  (mongoose.models.Coupon as Model<ICoupon>) ||
  mongoose.model<ICoupon>("Coupon", couponSchema);
