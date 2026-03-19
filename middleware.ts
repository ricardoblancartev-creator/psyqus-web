import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define rutas públicas - IMPORTANTE: el orden importa
const isPublicRoute = createRouteMatcher([
  // Páginas de autenticación
  '/sign-in(.*)',
  '/sign-up(.*)',
  
  // API routes
  '/api(.*)',
  
  // Páginas informativas públicas
  '/',
  '/articulos(.*)',
  '/ia',
  '/metodologia',
  '/privacidad',
  '/terminos',
  '/psicoeducacion',
  '/encuesta',
  '/gracias',
  
  // BUZÓN - TODAS las rutas del buzón son públicas
  '/buzon',
  '/buzon/login',
  '/buzon/(.*)',  // Esta es la forma correcta para subrutas en Clerk
]);

// Define rutas que requieren autenticación (opcional, para claridad)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/panel-psicologo(.*)',
  '/psicologo(.*)',
  '/evaluacion(.*)',
  '/insights(.*)',
  '/resultados(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // SIMPLIFICADO: Si la ruta NO es pública, protegerla
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  // Si es pública, no hacer nada - aquí entran /buzon y /buzon/login
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};