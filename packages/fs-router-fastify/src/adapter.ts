import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { FrameworkAdapter } from '@sib61/fs-router-core';

export class FastifyAdapter implements FrameworkAdapter<FastifyInstance> {
  constructor(private app: FastifyInstance) {}

  registerMiddleware(path: string, handler: Function): void {
    const middlewarePath = path.endsWith('/*') ? path.slice(0, -2) : path;
    this.app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.url.startsWith(middlewarePath)) {
        await handler(request, reply);
      }
    });
  }

  registerRoute(method: string, path: string, handler: Function): void {
    (this.app as any)[method.toLowerCase()](path, handler as any);
  }

  registerDefaultHandler(path: string, handler: Function, registeredMethods: string[]): void {
    if (registeredMethods.length === 0) {
      this.app.all(path, handler as any);
    } else {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as const;
      let unhandledMethods = methods.filter(method => !registeredMethods.includes(method));
      
      if (registeredMethods.includes('GET') && !registeredMethods.includes('HEAD')) {
        unhandledMethods = unhandledMethods.filter(m => m !== 'HEAD');
      }
      
      for (const method of unhandledMethods) {
        this.app.route({
          method,
          url: path,
          handler: handler as any
        });
      }
    }
  }

  transformPath(path: string): string {
    return path;
  }
}
