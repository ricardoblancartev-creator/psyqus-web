import './globals.css';

export const metadata = {
  title: 'Psyqus - NOM-035',
  description: 'Sistema de Bienestar Organizacional',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#020617]">
        {children}
      </body>
    </html>
  );
}