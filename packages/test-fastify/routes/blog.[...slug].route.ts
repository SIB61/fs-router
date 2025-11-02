import { FastifyRequest, FastifyReply } from 'fastify';

export default async function handler(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
  const { slug } = request.params;
  console.log(`[GET /blog/${slug}] Catch-all route accessed`);
  return reply.send({ message: 'Blog catch-all', slug });
}
