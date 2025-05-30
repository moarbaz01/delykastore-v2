import mongoose from "mongoose";

const costCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CostCategory =
  mongoose.models.CostCategory ||
  mongoose.model("CostCategory", costCategorySchema);
