import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        url: String,
      },
    ],
  },
  { timestamps: true }
);

export const Slider =
  mongoose.models.Slider || mongoose.model("Slider", sliderSchema);
