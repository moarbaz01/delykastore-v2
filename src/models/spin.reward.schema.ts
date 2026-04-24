import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISpinReward extends Document {
  transactionId: string;
  prize: string;
  status: "pending" | "reject" | "success";
  createdAt: Date;
  updatedAt: Date;
}

const spinRewardSchema = new Schema<ISpinReward>(
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
  (mongoose.models.SpinReward as Model<ISpinReward>) ||
  mongoose.model<ISpinReward>("SpinReward", spinRewardSchema);
