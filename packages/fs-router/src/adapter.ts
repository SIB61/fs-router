import type { ParsedRoute } from './types.js';

export interface FrameworkAdapter<TApp = any> {
  registerMiddleware(path: string, handler: Function): void;
  registerRoute(method: string, path: string, handler: Function): void;
  registerDefaultHandler(path: string, handler: Function, registeredMethods: string[]): void;
  transformPath(path: string): string;
}
