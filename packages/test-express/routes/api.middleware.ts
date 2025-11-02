import type { Request, Response, NextFunction } from 'express';

export default function apiMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('Content-Type', 'application/json');
  next();
}
