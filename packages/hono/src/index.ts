import type { Hono } from 'hono';
import type { RouterOptions } from '../../core/dist';
import { createRouter } from '../../core/dist';
import { HonoAdapter } from './adapter';

export async function useFsRouter(app: Hono, options: RouterOptions) {
  const adapter = new HonoAdapter(app);
  await createRouter(adapter, options);
}

export { HonoAdapter } from './adapter';
