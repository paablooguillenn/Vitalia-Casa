/** @type {import('next').NextConfig} */

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Permite serverActions y acceso externo (útil para desarrollo en red local)
  experimental: {
    serverActions: true,
  },
}

export default nextConfig
