import { ClerkProvider } from '@clerk/nextjs' // 1. Importa esto
import './globals.css' // O como se llame tu archivo de estilos

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider> {/* 2. Envuelve TODO con esto */}
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}