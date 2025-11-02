import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  console.log('[GET /users] Users list route accessed');
  res.json({ message: 'List of users', users: ['Alice', 'Bob', 'Charlie'] });
}
