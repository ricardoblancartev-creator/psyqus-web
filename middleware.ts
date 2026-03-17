import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/clerk-test',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/buzon(.*)',
  '/articulos(.*)',
  '/metodologia',
  '/privacidad',
  '/terminos',
  '/ia',
  '/psicoeducacion',
  '/encuesta',
  '/gracias',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.+\\\\.[\\\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
