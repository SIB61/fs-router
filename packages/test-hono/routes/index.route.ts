import { Context } from 'hono';

export default function handler(c: Context) {
  console.log('[GET /] Root route accessed');
  return c.json({ message: 'Root route', timestamp: new Date().toISOString() });
}
