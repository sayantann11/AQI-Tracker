/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  output: isStaticExport ? 'export' : undefined,
  images: {
    unoptimized: isStaticExport,
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
