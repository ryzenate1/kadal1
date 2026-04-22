import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that are always public — Clerk will NOT redirect unauthenticated users
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/login(.*)',
  '/auth/register(.*)',
  '/auth/forgot-password(.*)',
  '/sso-callback(.*)',
  '/api/auth/(.*)',
  '/api/create-order(.*)',
  '/api/verify-payment(.*)',
  '/api/orders(.*)',
  '/api/user/(.*)',
  '/api/products(.*)',
  '/api/categories(.*)',
  '/api/coupons(.*)',
  '/api/search(.*)',
  '/api/health(.*)',
  '/product/(.*)',
  '/category/(.*)',
  '/categories(.*)',
  '/fish/(.*)',
  '/search(.*)',
  '/offers(.*)',
  '/blog(.*)',
  '/cart(.*)',
  '/choose-location(.*)',
  '/choose-on-map(.*)',
  '/map-picker(.*)',
  '/terms-of-service(.*)',
  '/privacy(.*)',
  '/cookie-policy(.*)',
  '/help-support(.*)',
  '/reviews(.*)',
  '/login(.*)',
  '/simple-login(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // For protected routes, Clerk will handle redirecting to sign-in automatically
  // We only protect routes that truly require auth
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
