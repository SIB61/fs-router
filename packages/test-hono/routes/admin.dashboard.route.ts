import { Context } from 'hono';

export default function handler(c: Context) {
  console.log('[GET /admin/dashboard] Admin dashboard route');
  return c.json({ message: 'Admin dashboard', stats: { users: 100, posts: 500 } });
}
