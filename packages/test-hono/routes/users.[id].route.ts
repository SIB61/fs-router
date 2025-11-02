import { Context } from 'hono';

export default function handler(c: Context) {
  const id = c.req.param('id');
  console.log(`[GET /users/${id}] User detail route accessed`);
  return c.json({ message: 'User detail', userId: id });
}
