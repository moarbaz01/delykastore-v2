export function getOptimizedUrl(url: string | undefined, width: number = 800): string {
  if (!url) return "";
  
  // Only apply to Cloudinary URLs
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // Prevent double adding if it already has transformations
    if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto")) {
      return url;
    }
    
    // Inject Cloudinary optimization parameters: auto format, auto quality, max width
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  
  return url;
}
