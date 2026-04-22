/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables a self-contained server bundle for Docker production builds
  output: 'standalone',
};

export default nextConfig;
