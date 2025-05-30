import { cloudinaryUpload } from "@/utils/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse the form data
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const folderName = formData.get("folder") as string;

    // Validate the file
    if (!image) {
      return NextResponse.json(
        { error: "No image file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type (e.g., only allow images)
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (e.g., limit to 5MB)
    const maxSize = 10 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Upload the image to Cloudinary
    const { url } = await cloudinaryUpload(image, folderName);

    if (!url) {
      return NextResponse.json(
        { error: "Failed to upload image to Cloudinary" },
        { status: 500 }
      );
    }

    // Return the image URL
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
