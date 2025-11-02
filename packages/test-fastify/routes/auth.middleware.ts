import type { FastifyRequest, FastifyReply } from 'fastify';

export default async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  
  const token = authHeader.substring(7);
  if (token !== 'valid-token') {
    reply.code(403).send({ error: 'Forbidden' });
    return;
  }
}
