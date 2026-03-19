import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Define las rutas PÚBLICAS (accesibles sin autenticación)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
  '/api/clerk-test',
  '/articulos(.*)',
  '/ia',
  '/metodologia',
  '/privacidad',
  '/terminos',
  '/psicoeducacion',
  '/encuesta',
  '/gracias',
  '/buzon',              // ← HACE PÚBLICA /buzon
  '/buzon/login',        // ← HACE PÚBLICA /buzon/login
  '/buzon(.*)',          // ← HACE PÚBLICAS TODAS LAS SUBRUTAS DE /buzon
]);

// 2. Define rutas protegidas (opcional, para más claridad)
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
  // Si la ruta NO es pública, protegerla
  if (!isPublicRoute(req)) {
    await auth.protect(); // Redirige a /sign-in si no está autenticado
  }
  // Si es pública, no hace nada (aquí entran /buzon y /buzon/login)
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};