import type { Hono } from 'hono';
import type { RouterOptions } from '@sib61/fs-router-core';
import { createRouter } from '@sib61/fs-router-core';
import { HonoAdapter } from './adapter.js';

export async function createHonoRouter(app: Hono, options: RouterOptions) {
  const adapter = new HonoAdapter(app);
  await createRouter(adapter, options);
  return app;
}

export { HonoAdapter } from './adapter.js';
