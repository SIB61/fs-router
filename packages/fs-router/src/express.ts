import type { Application } from 'express';
import type { RouterOptions } from './types.js';
import { ExpressAdapter } from './adapters/express.js';
import { createRouter } from './factory.js';

export async function createExpressRouter(app: Application, options: RouterOptions) {
  const adapter = new ExpressAdapter(app);
  await createRouter(adapter, options);
  return app;
}
