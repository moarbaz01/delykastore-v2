import { cloudinary } from "@/utils/cloudinary";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Returns a signed payload so the browser can upload large videos straight to
// Cloudinary, bypassing the serverless request body limit.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { folder = "/banners" } = await req.json().catch(() => ({}));
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { folder, timestamp };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string,
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Upload sign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
