import mongoose, { Document, Model } from "mongoose";

export interface IPrize extends Document {
  productId: mongoose.Types.ObjectId;
  name: string;
  color: string;
  winRate: number;
  weight: number;
  limit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrizeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    match: /^#[0-9A-F]{6}$/i,
  },
  winRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  limit: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
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

// Update the updatedAt field on save
PrizeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Prize =
  (mongoose.models.Prize as Model<IPrize>) ||
  mongoose.model<IPrize>("Prize", PrizeSchema);

export default Prize;
