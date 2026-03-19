import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Definir rutas públicas EXPLÍCITAMENTE
const isPublicRoute = createRouteMatcher([
  // Autenticación - ABSOLUTAMENTE PÚBLICAS
  '/sign-in',
  '/sign-in/(.*)',
  '/sign-up',
  '/sign-up/(.*)',
  
  // API
  '/api/(.*)',
  
  // Home y páginas informativas
  '/',
  '/articulos/(.*)',
  '/ia',
  '/metodologia',
  '/privacidad',
  '/terminos',
  '/psicoeducacion',
  '/encuesta',
  '/gracias',
  
  // BUZÓN - COMPLETAMENTE PÚBLICO
  '/buzon',
  '/buzon/login',
  '/buzon/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.pathname;
  
  // LOG PARA DEPURACIÓN
  console.log(`🔄 Middleware ejecutándose para: ${url}`);
  
  // SI ES RUTA PÚBLICA, PERMITIR ACCESO INMEDIATAMENTE
  if (isPublicRoute(req)) {
    console.log(`✅ RUTA PÚBLICA: ${url} - Permitir acceso`);
    return; // Importante: NO hacer nada más
  }
  
  // SI NO ES PÚBLICA, PROTEGER
  console.log(`🔒 RUTA PROTEGIDA: ${url} - Requiere autenticación`);
  await auth.protect();
});

export const config = {
  matcher: [
    // Excluir archivos estáticos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};