/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Thêm cấu hình images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flood.phoenixtech.vn",
        port: "",
        pathname: "/**", // Cho phép mọi đường dẫn ảnh từ domain này
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**", // Cho phép ảnh placeholder
      },
    ],
  },
};

export default nextConfig;