// apps/web/next.config.mjs
const repo = 'statsdonkey';
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { appDir: true },

  // Required for GitHub Pages (static hosting)
  output: 'export',
  images: { unoptimized: true },

  // Serve the app from /statsdonkey when deployed to Pages
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',

  // Safer for static hosting so routes render as /path/index.html
  trailingSlash: true,
};

export default nextConfig;
