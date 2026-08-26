import { getAnnouncementSetting } from "@/lib/getAnnouncementSetting";
import { Megaphone } from "lucide-react";

import GlowBorder from "@/components/GlowBorder";

export default async function AnnouncementBar() {
  try {
    const { isAnnouncementActive, announcementText } =
      await getAnnouncementSetting();

    if (!isAnnouncementActive || !announcementText) {
      return null;
    }

    return (
      <div className="w-full px-3 md:px-4 mt-6 relative max-w-7xl md:mx-auto">
        <GlowBorder borderRadius={9999} className="w-full rounded-full">
          <div className="w-full rounded-[inherit] bg-[#1A1730]/80 backdrop-blur-md flex items-center overflow-hidden">
            <div className="z-10 flex items-center gap-2">
              <div className="bg-primary rounded-full px-3 py-2 flex items-center gap-2 whitespace-nowrap">
                <Megaphone size={14} className="text-white" />
              </div>
            </div>

            {/* Marquee effect: content is duplicated so it fills the
                track from the very first frame (no scroll-in delay) and
                loops seamlessly once translated by exactly half its
                width. */}
            <div className="flex-1 overflow-hidden bg-transparent relative">
              <div className="animate-marquee flex w-max whitespace-nowrap">
                <span className="text-white/90 text-sm font-medium pl-4 pr-12">
                  {announcementText}
                </span>
                <span
                  className="text-white/90 text-sm font-medium pl-4 pr-12"
                  aria-hidden="true"
                >
                  {announcementText}
                </span>
              </div>
            </div>
          </div>
        </GlowBorder>
      </div>
    );
  } catch (error) {
    console.error("AnnouncementBar DB error:", error);
    return null;
  }
}
