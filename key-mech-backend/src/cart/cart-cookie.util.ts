import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const COOKIE_NAME = 'cart_id';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

export function readCartId(req: Request): string | null {
  // Use cookie-parser's parsed cookies if available
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  
  // Fallback to manual parsing if cookie-parser isn't available
  const raw = req.headers.cookie;
  if (!raw) return null;
  const parts = raw.split(';').map((c) => c.trim().split('='));
  for (const [k, v] of parts) {
    if (k === COOKIE_NAME) return decodeURIComponent(v || '');
  }
  return null;
}

export function ensureCartCookie(req: Request, res: Response): string {
  const existing = readCartId(req);
  if (existing) return existing;
  const id = randomUUID();
  res.cookie(COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return id;
}

export function clearCartCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

