import { next } from '@vercel/functions';

function validCredentials(header) {
  const username = process.env.ACCESS_USERNAME;
  const password = process.env.ACCESS_PASSWORD;
  if (!username || !password || !header?.startsWith('Basic ')) return false;

  try {
    const decoded = atob(header.slice(6));
    const divider = decoded.indexOf(':');
    if (divider < 0) return false;
    return decoded.slice(0, divider) === username && decoded.slice(divider + 1) === password;
  } catch {
    return false;
  }
}

// Runs before both Vite's static files and the /api Vercel Function.
// This keeps the entire deployed app behind one HTTP Basic Auth prompt.
export default function middleware(request) {
  if (!process.env.ACCESS_USERNAME || !process.env.ACCESS_PASSWORD) {
    return new Response('BandSet access is not configured.', { status: 503 });
  }

  if (!validCredentials(request.headers.get('authorization'))) {
    return new Response('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="BandSet"' },
    });
  }

  return next();
}

export const config = { matcher: '/:path*' };
