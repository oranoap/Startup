/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Run these from node_modules at request time instead of bundling.
    serverComponentsExternalPackages: ["playwright-core", "@prisma/client"],
  },
  webpack: (config) => {
    // react-pdf's pdfjs dependency probes for the optional native canvas
    // package; stub it out for both server and client builds.
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
