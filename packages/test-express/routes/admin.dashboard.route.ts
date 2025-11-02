import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  console.log('[GET /admin/dashboard] Admin dashboard route');
  res.json({ message: 'Admin dashboard', stats: { users: 100, posts: 500 } });
}
