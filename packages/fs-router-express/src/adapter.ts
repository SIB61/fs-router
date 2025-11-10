import type { Application } from 'express';
import type { FrameworkAdapter } from '@fs-router/core';

export class ExpressAdapter implements FrameworkAdapter<Application> {
  constructor(private app: Application) {}

  registerMiddleware(path: string, handler: Function): void {
    this.app.use(path, handler as any);
  }

  registerRoute(method: string, path: string, handler: Function): void {
    (this.app as any)[method.toLowerCase()](path, handler);
  }

  registerDefaultHandler(path: string, handler: Function, registeredMethods: string[]): void {
    const allMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    const remainingMethods = allMethods.filter(m => !registeredMethods.includes(m));
    
    for (const method of remainingMethods) {
      (this.app as any)[method](path, handler);
    }
  }

  transformPath(path: string): string {
    return path.replace(/\*/g, '*');
  }
}
