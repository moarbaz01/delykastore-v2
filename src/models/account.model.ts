import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAccount extends Document {
  productId: mongoose.Types.ObjectId;
  costId: string;
  email: string;
  password?: string;
  additionalInfo?: string;
  isActive: boolean;
  isReserved: boolean;
  reservedExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
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
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    additionalInfo: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isReserved: {
      type: Boolean,
      default: false,
    },
    reservedExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Account =
  (mongoose.models.Account as Model<IAccount>) ||
  mongoose.model<IAccount>("Account", accountSchema);
