import { FastifyRequest, FastifyReply } from 'fastify';

export default async function handler(
  request: FastifyRequest<{ Params: { postId: string; commentId: string } }>,
  reply: FastifyReply
) {
  const { postId, commentId } = request.params;
  console.log(`[GET /posts/${postId}/comments/${commentId}] Nested param route accessed`);
  return reply.send({ message: 'Comment detail', postId, commentId });
}
