import type { FastifyRequest, FastifyReply } from 'fastify';

export default async function apiMiddleware(req: FastifyRequest, reply: FastifyReply) {
  reply.header('X-API-Version', '1.0');
  reply.header('Content-Type', 'application/json');
}
