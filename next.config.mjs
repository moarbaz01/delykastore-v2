const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "topupghorbd.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true, // Catches potential errors during development
  swcMinify: true, // Faster builds and minified JavaScript
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Removes console logs in production
  },
};

export default nextConfig;
