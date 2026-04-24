import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGiftTransaction extends Document {
  userId: string;
  zoneId?: string;
  giftId: mongoose.Types.ObjectId;
  cost: string;
  level: string;
  wagering: number;
  userWagering: number;
  productId: mongoose.Types.ObjectId;
  status: "pending" | "failed" | "success";
  createdAt: Date;
  updatedAt: Date;
}

const giftTransactionSchema = new Schema<IGiftTransaction>({
  userId: {
    type: String,
    required: true,
  },
  zoneId: {
    type: String,
  },
  giftId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Gift",
  },
  cost: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  wagering: {
    type: Number,
    required: true,
  },
  userWagering: {
    type: Number,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  status: {
    type: String,
    enum: ["pending", "failed", "success"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

giftTransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const GiftTransaction =
  (mongoose.models.GiftTransaction as Model<IGiftTransaction>) ||
  mongoose.model<IGiftTransaction>("GiftTransaction", giftTransactionSchema);
