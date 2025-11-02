import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const { slug } = req.params;
  console.log(`[GET /blog/${slug}] Catch-all route accessed`);
  res.json({ message: 'Blog catch-all', slug });
}
