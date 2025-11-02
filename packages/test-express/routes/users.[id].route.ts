import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const { id } = req.params;
  console.log(`[GET /users/${id}] User detail route accessed`);
  res.json({ message: 'User detail', userId: id });
}
