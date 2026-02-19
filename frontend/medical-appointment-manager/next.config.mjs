
/** @type {import('next').NextConfig} */


const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {},
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.0.186:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
