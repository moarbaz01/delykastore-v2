import { unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/database";
import { Setting } from "@/models/setting.model";

const DEFAULT_MAINTENANCE_MESSAGE =
  "We are currently undergoing maintenance. Please check back later.";

const fetchAnnouncementSetting = unstable_cache(
  async () => {
    await dbConnect();
    const setting = await Setting.findOne().lean();
    return {
      isAnnouncementActive: setting?.isAnnouncementActive ?? false,
      announcementText: setting?.announcementText ?? "",
      isMaintenanceMode: setting?.isMaintenanceMode ?? false,
      maintenanceMessage: setting?.maintenanceMessage ?? DEFAULT_MAINTENANCE_MESSAGE,
    };
  },
  ["announcement-setting"],
  { revalidate: 60, tags: ["settings"] },
);

// The root layout calls this on every page, so a database error must not take
// the whole site down; fall back to defaults instead
export const getAnnouncementSetting = async () => {
  try {
    return await fetchAnnouncementSetting();
  } catch (error) {
    console.error("getAnnouncementSetting failed:", error);
    return {
      isAnnouncementActive: false,
      announcementText: "",
      isMaintenanceMode: false,
      maintenanceMessage: DEFAULT_MAINTENANCE_MESSAGE,
    };
  }
};
