import type { Hono } from 'hono';
import type { RouterOptions } from './types.js';
import { HonoAdapter } from './adapters/hono.js';
import { createRouter } from './factory.js';

export async function createHonoRouter(app: Hono, options: RouterOptions) {
  const adapter = new HonoAdapter(app);
  await createRouter(adapter, options);
  return app;
}
