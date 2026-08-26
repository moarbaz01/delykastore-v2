import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  productId: mongoose.Schema.Types.ObjectId;
  costId: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    costId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Delete the model if it exists to avoid caching issues with old schema
if (mongoose.models && mongoose.models.Event) {
  delete (mongoose.models as any).Event;
}

export const Event = mongoose.model<IEvent>("Event", eventSchema);
