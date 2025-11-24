import type { Application } from 'express';
import type { RouterOptions } from '../../core/dist';
import { createRouter } from '../../core/dist';
import { ExpressAdapter } from './adapter';

export async function useFsRouter(app: Application, options: RouterOptions) {
  const adapter = new ExpressAdapter(app);
  await createRouter(adapter, options);
}

export { ExpressAdapter } from './adapter';
