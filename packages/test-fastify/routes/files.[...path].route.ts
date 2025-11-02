import { FastifyRequest, FastifyReply } from 'fastify';

export default async function handler(request: FastifyRequest<{ Params: { path: string } }>, reply: FastifyReply) {
  const { path } = request.params;
  console.log(`[GET /files/${path}] File catch-all route`);
  return reply.send({ message: 'File access', path });
}
