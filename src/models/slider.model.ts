import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISlider extends Document {
  title: string;
  description: string;
  images: { url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const sliderSchema = new Schema<ISlider>(
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
  (mongoose.models.Slider as Model<ISlider>) ||
  mongoose.model<ISlider>("Slider", sliderSchema);
