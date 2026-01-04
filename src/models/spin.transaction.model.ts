import mongoose, { Schema } from "mongoose";

const spinTransactionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    zoneId: {
      type: String,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    costId: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    prize: {
      type: String,
    },
    spin: {
      type: Number,
      required: true,
      max: 1,
    },
    status: {
      type: String,
      enum: ["pending", "reject", "success"],
      default: "pending",
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

spinTransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const SpinTransaction =
  mongoose.models.SpinTransaction ||
  mongoose.model("SpinTransaction", spinTransactionSchema);
