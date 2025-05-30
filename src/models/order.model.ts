import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    costId: {
      type: String,
      required: true,
    },
    orderDetails: {
      type: String,
      required: true,
    },
    gameCredentials: {
      userId: {
        type: String,
      },
      zoneId: {
        type: String,
      },
      game: {
        type: String,
      },
    },
    region: {
      type: String,
    },
    orderType: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: "",
    },
    couponCode: {
      type: String,
      default: "",
    },
    isCouponApplied: {
      type: Boolean,
      default: false,
    },

    couponDetails: {
      type: Object,
      default: {},
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    amount: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
