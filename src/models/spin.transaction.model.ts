import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISpinTransaction extends Document {
  userId: string;
  zoneId?: string;
  productId: mongoose.Types.ObjectId;
  costId: string;
  transactionId: string;
  prize?: string;
  spin: number;
  status: "pending" | "reject" | "success";
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const spinTransactionSchema = new Schema<ISpinTransaction>(
  {
    userId: {
      type: String,
      required: true,
    },
    zoneId: {
      type: String,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    costId: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    prize: {
      type: String,
    },
    spin: {
      type: Number,
      required: true,
      max: 1,
    },
    status: {
      type: String,
      enum: ["pending", "reject", "success"],
      default: "pending",
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const SpinTransaction =
  (mongoose.models.SpinTransaction as Model<ISpinTransaction>) ||
  mongoose.model<ISpinTransaction>("SpinTransaction", spinTransactionSchema);
