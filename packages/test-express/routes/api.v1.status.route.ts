import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  console.log('[GET /api/v1/status] API status check');
  res.json({ status: 'ok', version: '1.0.0', uptime: process.uptime() });
}
