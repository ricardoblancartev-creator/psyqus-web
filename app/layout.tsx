import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Psyqus · Habilidades blandas y bienestar para tu equipo",
  description:
    "Plataforma mexicana para desarrollar habilidades blandas y cuidar el bienestar de tu equipo con Shorts y microcursos, con las evaluaciones NOM-035 integradas.",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}