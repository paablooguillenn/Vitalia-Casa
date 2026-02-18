
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
        destination: 'http://10.48.222.3:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
