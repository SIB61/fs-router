import type { FastifyInstance } from 'fastify';
import type { RouterOptions } from '../../core/dist';
import { createRouter } from '../../core/dist';
import { FastifyAdapter } from './adapter';

export async function useFsRouter(app: FastifyInstance, options: RouterOptions) {
  const adapter = new FastifyAdapter(app);
  await createRouter(adapter, options);
}

export { FastifyAdapter } from './adapter';
