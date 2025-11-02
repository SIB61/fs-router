import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const { postId, commentId } = req.params;
  console.log(`[GET /posts/${postId}/comments/${commentId}] Nested param route accessed`);
  res.json({ message: 'Comment detail', postId, commentId });
}
