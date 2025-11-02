import type { Context, Next } from 'hono';

export default async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  if (token !== 'valid-token') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  await next();
}
