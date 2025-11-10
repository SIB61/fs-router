import type { Application } from 'express';
import type { RouterOptions } from '@sib61/fs-router-core';
import { createRouter } from '@sib61/fs-router-core';
import { ExpressAdapter } from './adapter.js';

export async function createExpressRouter(app: Application, options: RouterOptions) {
  const adapter = new ExpressAdapter(app);
  await createRouter(adapter, options);
  return app;
}

export { ExpressAdapter } from './adapter.js';
