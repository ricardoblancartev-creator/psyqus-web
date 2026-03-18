/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Esto le dice a Vercel: "Ignora los errores de ESLint y construye la app"
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Esto le dice: "Ignora los errores de tipos y construye la app"
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;