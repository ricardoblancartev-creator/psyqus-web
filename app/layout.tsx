import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Psyqus - Plataforma NOM-035",
  description: "Plataforma SaaS para implementación de la NOM-035 en México",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

