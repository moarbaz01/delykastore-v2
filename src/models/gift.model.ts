import mongoose, { Schema } from "mongoose";

const giftSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    bannerText: {
      type: String,
    },

    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },

    wageringLevels: [
      {
        level: Number,
        wagering: Number,
        costIds: [String],
      },
    ],

    features: [
      {
        title: String,
        value: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

giftSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Gift = mongoose.models.Gift || mongoose.model("Gift", giftSchema);
