/**
 * Extracts the public ID from a Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public ID or null if not found
 */
const extractPublicId = (url: string): string | null => {
  try {
    // Example URL formats:
    // https://res.cloudinary.com/demo/image/upload/v1234567/sample.jpg
    // https://res.cloudinary.com/demo/image/upload/v1234567/folder/sample.jpg
    // https://res.cloudinary.com/demo/video/upload/v1234567/sample.mp4

    // Split the URL into parts
    const parts = url.split("/");

    // Find the index of 'upload' which is right before the version and public ID
    const uploadIndex = parts.findIndex((part) => part === "upload");

    if (uploadIndex === -1 || uploadIndex >= parts.length - 2) {
      return null;
    }

    // The public ID consists of all parts after the version (v1234567)
    const publicIdParts = parts.slice(uploadIndex + 2);

    // Join the parts and remove the file extension if present
    let publicId = publicIdParts.join("/");
    publicId = publicId.replace(/\.[^/.]+$/, ""); // Remove file extension

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

export { extractPublicId };
