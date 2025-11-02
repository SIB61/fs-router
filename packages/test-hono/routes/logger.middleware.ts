import type { Context, Next } from 'hono';

export default async function logger(c: Context, next: Next) {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  await next();
}
