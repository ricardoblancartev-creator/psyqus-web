import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "Psyqus",
  description: "Plataforma de detección de riesgos psicosociales NOM-035",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className="bg-slate-950 text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}