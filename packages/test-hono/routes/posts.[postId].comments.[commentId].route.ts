import { Context } from 'hono';

export default function handler(c: Context) {
  const postId = c.req.param('postId');
  const commentId = c.req.param('commentId');
  console.log(`[GET /posts/${postId}/comments/${commentId}] Nested param route accessed`);
  return c.json({ message: 'Comment detail', postId, commentId });
}
