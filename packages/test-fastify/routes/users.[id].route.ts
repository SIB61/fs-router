import { FastifyRequest, FastifyReply } from 'fastify';

export default async function handler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  console.log(`[GET /users/${id}] User detail route accessed`);
  return reply.send({ message: 'User detail', userId: id });
}
