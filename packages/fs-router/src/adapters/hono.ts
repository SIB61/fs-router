import type { Hono } from 'hono';
import type { FrameworkAdapter } from '../adapter.js';

export class HonoAdapter implements FrameworkAdapter<Hono> {
  constructor(private app: Hono) {}

  registerMiddleware(path: string, handler: Function): void {
    this.app.use(path, handler as any);
  }

  registerRoute(method: string, path: string, handler: Function): void {
    const methodLower = method.toLowerCase();
    if (methodLower === 'head') {
      this.app.on('HEAD', path, handler as any);
    } else {
      (this.app as any)[methodLower](path, handler as any);
    }
  }

  registerDefaultHandler(path: string, handler: Function, registeredMethods: string[]): void {
    if (registeredMethods.length === 0) {
      this.app.all(path, handler as any);
    } else {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as const;
      const unhandledMethods = methods.filter(method => !registeredMethods.includes(method));
      
      for (const method of unhandledMethods) {
        this.app.on(method, path, handler as any);
      }
    }
  }

  transformPath(path: string): string {
    return path;
  }
}
