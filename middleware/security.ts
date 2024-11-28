import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from './rate-limit';

// Initialize rate limiter
const limiter = rateLimit({
  interval: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  uniqueTokenPerInterval: 500,
});

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers (Confidentiality & Integrity)
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Rate Limiting (Availability)
  try {
    await limiter.check(response, 10, request.ip || 'anonymous'); // 10 requests per IP
  } catch {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // Authentication Check for Protected Routes
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/settings')) {
    const token = await getToken({ req: request });
    
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Add user context to headers for logging
    const userId = token.sub || 'unknown';
    response.headers.set('X-User-ID', userId);
  }

  // Sanitize Response Data (Confidentiality)
  response.headers.delete('X-Powered-By');
  response.headers.set('Server', '');

  return response;
}
