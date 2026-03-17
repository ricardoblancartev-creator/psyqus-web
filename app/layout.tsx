import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { ClerkProvider } from '@clerk/nextjs'; // <-- ESTO ES LO QUE FALTA PARA EL LOGIN

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "PSYQUS - Intelligence & Peace Management",
  description: "Plataforma de inteligencia psicológica organizacional NOM-035",
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ClerkProvider> {/* <-- ESTO ACTIVA EL REGISTRO DE GOOGLE */}
      <html lang="es" className="dark">
        <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} font-sans antialiased bg-[#020617] text-slate-50`}>
          {/* bg-[#020617] pone el fondo oscuro profesional de inmediato */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}