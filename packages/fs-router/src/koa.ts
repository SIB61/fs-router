import type Router from '@koa/router';
import type { RouterOptions } from './types.js';
import { KoaAdapter } from './adapters/koa.js';
import { createRouter } from './factory.js';

export async function createKoaRouter(router: Router, options: RouterOptions) {
  const adapter = new KoaAdapter(router);
  await createRouter(adapter, options);
  return router;
}
