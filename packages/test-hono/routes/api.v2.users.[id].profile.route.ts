import { Context } from 'hono';

export default function handler(c: Context) {
  const id = c.req.param('id');
  console.log(`[GET /api/v2/users/${id}/profile] Deep nested route`);
  return c.json({ message: 'User profile', userId: id, version: 2 });
}
