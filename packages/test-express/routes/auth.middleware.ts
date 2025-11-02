import type { Request, Response, NextFunction } from 'express';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  const token = authHeader.substring(7);
  if (token !== 'valid-token') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  
  next();
}
