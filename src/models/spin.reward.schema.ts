import mongoose, { Schema } from "mongoose";

const spinRewardSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
    },
    prize: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reject", "success"],
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
  },
  {
    timestamps: true,
  }
);

spinRewardSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const SpinReward =
  mongoose.models.SpinReward || mongoose.model("SpinReward", spinRewardSchema);
