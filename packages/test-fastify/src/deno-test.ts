import Fastify from 'npm:fastify@^5.2.2';
import { createFastifyRouter } from '../../fs-router/dist/fastify.mjs';

const fastify = Fastify();

await createFastifyRouter(fastify, { routesDir: './routes', verbose: true });

console.log('Deno + Fastify test completed successfully!');

Deno.exit(0);
