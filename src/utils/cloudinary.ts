// Cloudinary
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Function
const cloudinaryUpload = async (
  file: File,
  folder: string = "images"
): Promise<{ url: string } | null> => {
  try {
    // Convert the file to a base64 string
    const base64String = Buffer.from(await file.arrayBuffer()).toString(
      "base64"
    );

    // Upload the file to Cloudinary
    const data: UploadApiResponse | UploadApiErrorResponse = await new Promise(
      (resolve) => {
        cloudinary.uploader.upload(
          `data:${file.type};base64,${base64String}`,
          {
            folder,
            resource_type: "auto",
          },
          (error, result) => {
            resolve(result as UploadApiResponse | UploadApiErrorResponse);
          }
        );
      }
    );
    if ("error" in data) {
      throw new Error(data.error.message);
    }
    return { url: data.secure_url };
  } catch (error: any) {
    const err = error as UploadApiErrorResponse;
    console.error("Cloudinary Upload Error:", err.message || error);
    return null;
  }
};

// Delete Function
const cloudinaryDelete = async (
  publicId: string,
  resourceType: string = "image"
): Promise<{ success: boolean }> => {
  try {
    const result = await new Promise<
      UploadApiResponse | UploadApiErrorResponse
    >((resolve) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          resolve(result as UploadApiResponse | UploadApiErrorResponse);
        }
      );
    });

    if ("error" in result) {
      throw new Error(result.error.message);
    }

    if (result.result !== "ok") {
      throw new Error(`Failed to delete file with public ID: ${publicId}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Cloudinary Delete Error:", error.message || error);
    return { success: false };
  }
};

export { cloudinary, cloudinaryUpload, cloudinaryDelete };
