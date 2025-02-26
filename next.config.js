/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['services.leadconnectorhq.com', 'rest.gohighlevel.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GHL_CLIENT_ID: process.env.GHL_CLIENT_ID,
    GHL_CLIENT_SECRET: process.env.GHL_CLIENT_SECRET,
    GHL_REDIRECT_URI: process.env.GHL_REDIRECT_URI,
    GHL_API_V1_BASE_URL: 'https://rest.gohighlevel.com/v1',
    GHL_API_V2_BASE_URL: 'https://services.leadconnectorhq.com',
  },
}

module.exports = nextConfig 