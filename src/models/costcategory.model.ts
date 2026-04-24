import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICostCategory extends Document {
  name: string;
  type: "topup" | "account";
  createdAt: Date;
  updatedAt: Date;
}

const costCategorySchema = new Schema<ICostCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["topup", "account"],
      default: "topup",
    },
  },
  {
    timestamps: true,
  }
);

export const CostCategory =
  (mongoose.models.CostCategory as Model<ICostCategory>) ||
  mongoose.model<ICostCategory>("CostCategory", costCategorySchema);
