import type Koa from 'koa';
import type Router from '@koa/router';
import type { FrameworkAdapter } from '../adapter.js';

export class KoaAdapter implements FrameworkAdapter<Router> {
  constructor(private router: Router) {}

  registerMiddleware(path: string, handler: Function): void {
    this.router.use(path, handler as any);
  }

  registerRoute(method: string, path: string, handler: Function): void {
    const methodLower = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
    this.router[methodLower](path, async (ctx: any) => {
      await handler(ctx);
    });
  }

  registerDefaultHandler(path: string, handler: Function, registeredMethods: string[]): void {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as const;
    const unhandledMethods = methods.filter(method => !registeredMethods.includes(method));
    
    for (const method of unhandledMethods) {
      this.router.register(path, [method], async (ctx: any) => {
        await handler(ctx);
      });
    }
  }

  transformPath(path: string): string {
    return path;
  }
}
