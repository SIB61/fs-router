import { FastifyRequest, FastifyReply } from 'fastify';

export default async function handler(request: FastifyRequest, reply: FastifyReply) {
  console.log('[GET /admin/dashboard] Admin dashboard route');
  return reply.send({ message: 'Admin dashboard', stats: { users: 100, posts: 500 } });
}
