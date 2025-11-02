import { FastifyRequest, FastifyReply } from 'fastify';

export default async function handler(request: FastifyRequest, reply: FastifyReply) {
  console.log('[GET /] Root route accessed');
  return reply.send({ message: 'Root route', timestamp: new Date().toISOString() });
}
