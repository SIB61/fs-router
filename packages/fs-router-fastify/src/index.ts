import type { FastifyInstance } from 'fastify';
import type { RouterOptions } from '@sib61/fs-router-core';
import { createRouter } from '@sib61/fs-router-core';
import { FastifyAdapter } from './adapter.js';

export async function createFastifyRouter(app: FastifyInstance, options: RouterOptions) {
  const adapter = new FastifyAdapter(app);
  await createRouter(adapter, options);
  return app;
}

export async function fsRouter(app: FastifyInstance, options: RouterOptions = { routesDir: './routes' }) {
  return createFastifyRouter(app, options);
}

export { FastifyAdapter } from './adapter.js';
