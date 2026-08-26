import mongoose, { Document, Schema } from "mongoose";

export interface ISetting extends Document {
  announcementText: string;
  isAnnouncementActive: boolean;
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    announcementText: {
      type: String,
      default: "",
    },
    isAnnouncementActive: {
      type: Boolean,
      default: false,
    },
    isMaintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: "We are currently undergoing maintenance. Please check back later.",
    },
  },
  { timestamps: true },
);

// Delete the model if it exists to avoid caching issues with old schema
if (mongoose.models && mongoose.models.Setting) {
  delete (mongoose.models as any).Setting;
}

export const Setting = mongoose.model<ISetting>("Setting", settingSchema);
