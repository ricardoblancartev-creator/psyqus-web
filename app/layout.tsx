import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Psyqus Web",
  description: "Intelligence & Peace Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es" className="dark">
        <body className={`${inter.className} bg-[#020617] text-white antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}