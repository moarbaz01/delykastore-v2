import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
  costId: string;
  orderDetails: string;
  gameCredentials: {
    userId?: string;
    zoneId?: string;
    game?: string;
    urlLink?: string;
  };
  region?: string;
  orderType: string;
  transactionId?: string;
  failureReason?: string;
  couponCode?: string;
  isCouponApplied: boolean;
  couponDetails?: any;
  product?: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  account?: mongoose.Types.ObjectId;
  amount: string;
  status: "pending" | "success" | "failed";
  accountDetails?: {
    email: string;
    password?: string;
    additionalInfo?: string;
  };
  expiresAt?: Date;
  isProcessing?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
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
      urlLink: {
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
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
    accountDetails: {
      email: { type: String },
      password: { type: String },
      additionalInfo: { type: String },
    },
    expiresAt: {
      type: Date,
    },
    isProcessing: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Order =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", orderSchema);
