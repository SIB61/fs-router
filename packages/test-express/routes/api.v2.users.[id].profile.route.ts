import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const { id } = req.params;
  console.log(`[GET /api/v2/users/${id}/profile] Deep nested route`);
  res.json({ message: 'User profile', userId: id, version: 2 });
}
