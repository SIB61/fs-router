import { FastifyRequest, FastifyReply } from 'fastify';

export default async function handler(request: FastifyRequest, reply: FastifyReply) {
  console.log('[GET /users] Users list route accessed');
  return reply.send({ message: 'List of users', users: ['Alice', 'Bob', 'Charlie'] });
}
