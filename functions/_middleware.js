// Cloudflare Pages Middleware — verifies Supabase JWT before serving premium paths.
// SUPABASE_JWT_SECRET must be set as a Cloudflare Pages environment variable (secret).

const PROTECTED_PREFIXES = [
  '/reports/monthly/',
  '/intelligence/signals/'
];

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  const isProtected = PROTECTED_PREFIXES.some(p => url.pathname.startsWith(p));
  if (!isProtected) return next();

  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/sb-access-token=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;

  if (!token) return redirectToLogin(url);

  try {
    const payload = await verifyJwt(token, env.SUPABASE_JWT_SECRET);

    // Check plan: Supabase puts app_metadata in the JWT as 'app_metadata' claim.
    // We also support a 'plan' claim at the top level for simpler setups.
    const plan =
      (payload.app_metadata && payload.app_metadata.plan) ||
      payload.plan ||
      'free';

    if (plan !== 'premium') {
      return redirectToLogin(url, 'upgrade');
    }

    return next();
  } catch {
    return redirectToLogin(url);
  }
}

function redirectToLogin(url, reason) {
  const dest = new URL('/login/', url.origin);
  dest.searchParams.set('next', url.pathname);
  if (reason) dest.searchParams.set('reason', reason);
  return Response.redirect(dest.toString(), 302);
}

async function verifyJwt(token, secret) {
  if (!secret) throw new Error('SUPABASE_JWT_SECRET not configured');

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed JWT');

  const [headerB64, payloadB64, sigB64] = parts;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const sig = base64urlDecode(sigB64);
  const valid = await crypto.subtle.verify('HMAC', key, sig, data);
  if (!valid) throw new Error('Invalid signature');

  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
  if (payload.exp && payload.exp < Date.now() / 1000) throw new Error('Token expired');

  return payload;
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}
