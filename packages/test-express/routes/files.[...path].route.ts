import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const { path } = req.params;
  console.log(`[GET /files/${path}] File catch-all route`);
  res.json({ message: 'File access', path });
}
