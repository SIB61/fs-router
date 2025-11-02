import { FastifyRequest, FastifyReply } from 'fastify';

export default async function handler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  console.log(`[GET /api/v2/users/${id}/profile] Deep nested route`);
  return reply.send({ message: 'User profile', userId: id, version: 2 });
}
