import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  type: "topup" | "account";
  game: string;
  slides: string[];
  banner?: string;
  region?: string;
  isDeleted: boolean;
  apiName?: string;
  isApi: boolean;
  stock: boolean;
  spinActive: boolean;
  spinCostIds: string[];
  cost: {
    id: string;
    price: string;
    amount?: string;
    durationDays?: number;
    note?: string;
    image?: string;
    category: string;
  }[];
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["topup", "account"],
      default: "topup",
    },
    game: {
      type: String,
      required: true,
    },
    slides: [
      {
        type: String,
      },
    ],
    banner: {
      type: String,
    },
    region: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    apiName: {
      type: String,
    },
    isApi: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Boolean,
      default: true,
    },
    spinActive: {
      type: Boolean,
      default: false,
    },
    spinCostIds: {
      type: [String],
      default: [],
    },
    cost: [
      {
        id: {
          type: String,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },
        amount: {
          type: String,
        },
        durationDays: {
          type: Number,
        },
        note: {
          type: String,
        },
        image: {
          type: String,
        },
        category: {
          type: String,
          default: "no_category",
        },
      },
    ],
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Delete the model if it exists to avoid caching issues with old schema
if (mongoose.models && mongoose.models.Product) {
  delete (mongoose.models as any).Product;
}

export const Product = mongoose.model<IProduct>("Product", productSchema);
