import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrderLog extends Document {
  transactionId?: string;
  orderId?: mongoose.Types.ObjectId;
  provider: string;
  requestPayload?: any;
  responsePayload?: any;
  status: "success" | "failed" | "pending";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderLogSchema = new Schema<IOrderLog>(
  {
    transactionId: {
      type: String,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    provider: {
      type: String,
      required: true,
    },
    requestPayload: {
      type: Schema.Types.Mixed,
    },
    responsePayload: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true },
);

export const OrderLog =
  (mongoose.models.OrderLog as Model<IOrderLog>) ||
  mongoose.model<IOrderLog>("OrderLog", orderLogSchema);
