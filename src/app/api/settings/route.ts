import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { dbConnect } from "@/lib/database";
import { Setting } from "@/models/setting.model";

export async function GET() {
  try {
    await dbConnect();
    const setting = await Setting.findOne();
    if (!setting) {
      return NextResponse.json(
        { announcementText: "", isAnnouncementActive: false, isMaintenanceMode: false, maintenanceMessage: "We are currently undergoing maintenance. Please check back later." },
        { status: 200 },
      );
    }
    return NextResponse.json(setting, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching settings:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { announcementText, isAnnouncementActive, isMaintenanceMode, maintenanceMessage } = body;

    let setting = await Setting.findOne();
    if (setting) {
      if (announcementText !== undefined) setting.announcementText = announcementText;
      if (isAnnouncementActive !== undefined) setting.isAnnouncementActive = isAnnouncementActive;
      if (isMaintenanceMode !== undefined) setting.isMaintenanceMode = isMaintenanceMode;
      if (maintenanceMessage !== undefined) setting.maintenanceMessage = maintenanceMessage;
      await setting.save();
    } else {
      setting = await Setting.create({
        announcementText,
        isAnnouncementActive,
        isMaintenanceMode,
        maintenanceMessage,
      });
    }

    revalidateTag("settings");

    return NextResponse.json(
      { message: "Settings updated successfully", setting },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating settings:", error.message);
    return NextResponse.json(
      { message: "Failed to update settings" },
      { status: 500 },
    );
  }
}
