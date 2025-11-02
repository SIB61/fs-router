import type { FastifyRequest, FastifyReply } from 'fastify';

export default async function logger(req: FastifyRequest, reply: FastifyReply) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
}
