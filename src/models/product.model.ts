import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
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
          type: String, // Ensure this is defined as String
          required: true,
        },
        amount: {
          type: String, // Ensure this is defined as String
          required: true,
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
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
