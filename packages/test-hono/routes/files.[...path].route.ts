import { Context } from 'hono';

export default function handler(c: Context) {
  const path = c.req.param('path');
  console.log(`[GET /files/${path}] File catch-all route`);
  return c.json({ message: 'File access', path });
}
