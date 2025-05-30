import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
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
  { timestamps: true }
);

export const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
