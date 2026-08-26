import { unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/database";
import { Setting } from "@/models/setting.model";

export const getAnnouncementSetting = unstable_cache(
  async () => {
    await dbConnect();
    const setting = await Setting.findOne().lean();
    return {
      isAnnouncementActive: setting?.isAnnouncementActive ?? false,
      announcementText: setting?.announcementText ?? "",
      isMaintenanceMode: setting?.isMaintenanceMode ?? false,
      maintenanceMessage: setting?.maintenanceMessage ?? "We are currently undergoing maintenance. Please check back later.",
    };
  },
  ["announcement-setting"],
  { revalidate: 60, tags: ["settings"] },
);
