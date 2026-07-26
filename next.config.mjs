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
      {
        protocol: "https",
        hostname: "aluu.in",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "t.me",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.telegram.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: false,
  swcMinify: true, // Faster builds and minified JavaScript
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Removes console logs in production
  },
};

export default nextConfig;
