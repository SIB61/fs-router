import { Context } from 'hono';

export default function handler(c: Context) {
  console.log('[GET /api/v1/status] API status check');
  return c.json({ status: 'ok', version: '1.0.0', uptime: process.uptime() });
}
