import type Router from '@koa/router';
import type { RouterOptions } from '../../core/dist';
import { createRouter } from '../../core/dist';
import { KoaAdapter } from './adapter';

export async function useFsRouter(router: Router, options: RouterOptions) {
  const adapter = new KoaAdapter(router);
  await createRouter(adapter, options);
}

export { KoaAdapter } from './adapter';
