/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Tối ưu cho Canvas render loop
  allowedDevOrigins: ['*.trycloudflare.com', '*.loca.lt', '*.ngrok-free.app', '*.pinggy.link', 'localhost:3000', 'localhost:3001'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
