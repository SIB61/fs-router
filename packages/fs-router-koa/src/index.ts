import type Router from '@koa/router';
import type { RouterOptions } from '@fs-router/core';
import { createRouter } from '@fs-router/core';
import { KoaAdapter } from './adapter.js';

export async function createKoaRouter(router: Router, options: RouterOptions) {
  const adapter = new KoaAdapter(router);
  await createRouter(adapter, options);
  return router;
}

export { KoaAdapter } from './adapter.js';
