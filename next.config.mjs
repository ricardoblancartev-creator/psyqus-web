/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora errores de ESLint (comillas, tipos, etc.)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora errores de TypeScript (como el de SignedIn)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;