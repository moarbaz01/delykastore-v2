import { Schema, models, model } from "mongoose";

const giftTransactionSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  zoneId: {
    type: String,
  },
  giftId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Gift",
  },

  cost: {
    type: String,
    required: true,
  },

  level: {
    type: String,
    required: true,
  },

  wagering: {
    type: Number,
    required: true,
  },

  userWagering: {
    type: Number,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  status: {
    type: String,
    enum: ["pending", "failed", "success"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

giftTransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const GiftTransaction =
  models.GiftTransaction || model("GiftTransaction", giftTransactionSchema);
