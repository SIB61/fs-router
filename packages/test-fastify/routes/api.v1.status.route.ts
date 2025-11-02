import { FastifyRequest, FastifyReply } from 'fastify';

export default async function handler(request: FastifyRequest, reply: FastifyReply) {
  console.log('[GET /api/v1/status] API status check');
  return reply.send({ status: 'ok', version: '1.0.0', uptime: process.uptime() });
}
