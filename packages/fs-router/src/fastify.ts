import type { FastifyInstance } from 'fastify';
import type { RouterOptions } from './types.js';
import { FastifyAdapter } from './adapters/fastify.js';
import { createRouter } from './factory.js';

export async function createFastifyRouter(app: FastifyInstance, options: RouterOptions) {
  const adapter = new FastifyAdapter(app);
  await createRouter(adapter, options);
  return app;
}

export async function fsRouter(app: FastifyInstance, options: RouterOptions = { routesDir: './routes' }) {
  return createFastifyRouter(app, options);
}
