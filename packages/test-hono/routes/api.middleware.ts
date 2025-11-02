import type { Context, Next } from 'hono';

export default async function apiMiddleware(c: Context, next: Next) {
  c.header('X-API-Version', '1.0');
  c.header('Content-Type', 'application/json');
  await next();
}
