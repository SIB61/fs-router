import Fastify from 'fastify';
import { createFastifyRouter } from 'fs-router/fastify';

const fastify = Fastify();

await createFastifyRouter(fastify, { routesDir: './routes', verbose: true });

fastify.listen({ port: 3002 }, (err, address) => {
  if (err) throw err;
  console.log(`Fastify server running on ${address}`);
});
