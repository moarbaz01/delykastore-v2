import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGift extends Document {
  productId: mongoose.Types.ObjectId;
  bannerText?: string;
  startDate?: Date;
  endDate?: Date;
  wageringLevels: {
    level: number;
    wagering: number;
    costIds: string[];
  }[];
  features: {
    title: string;
    value: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const giftSchema = new Schema<IGift>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    bannerText: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    wageringLevels: [
      {
        level: Number,
        wagering: Number,
        costIds: [String],
      },
    ],
    features: [
      {
        title: String,
        value: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Gift =
  (mongoose.models.Gift as Model<IGift>) ||
  mongoose.model<IGift>("Gift", giftSchema);
