/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  basePath: "/lighthouse",
  assetPrefix: isProd ? "/lighthouse" : "",
};

export default nextConfig;
