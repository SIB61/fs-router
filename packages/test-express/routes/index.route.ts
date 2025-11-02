import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  console.log('[GET /] Root route accessed');
  res.json({ message: 'Root route', timestamp: new Date().toISOString() });
}
