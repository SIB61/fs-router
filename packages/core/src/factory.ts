import { parseRoutes, loadRouteHandlers } from './parser.js';
import type { RouterOptions } from './types.js';
import { createLogger } from './logger.js';
import type { FrameworkAdapter } from './adapter.js';

export async function createRouter<TApp>(
  adapter: FrameworkAdapter<TApp>,
  options: RouterOptions
): Promise<void> {
  const routes = parseRoutes(options.routesDir);
  const logger = createLogger(options.verbose || false);

  for (const route of routes) {
    await loadRouteHandlers(route);

    logger.logRoute(route.isMiddleware ? 'Middleware' : 'Route', route.path, route.filePath);

    const transformedPath = adapter.transformPath(route.path);

    if (route.isMiddleware) {
      const handler = route.handlers.default || route.handlers.GET;
      if (handler) {
        adapter.registerMiddleware(transformedPath, handler);
        logger.logHandler('Middleware', transformedPath);
      }
    } else {
      const registeredMethods: string[] = [];
      const methods: Array<{ method: string; handler: Function }> = [];

      if (route.handlers.GET) methods.push({ method: 'GET', handler: route.handlers.GET });
      if (route.handlers.POST) methods.push({ method: 'POST', handler: route.handlers.POST });
      if (route.handlers.PUT) methods.push({ method: 'PUT', handler: route.handlers.PUT });
      if (route.handlers.DELETE) methods.push({ method: 'DELETE', handler: route.handlers.DELETE });
      if (route.handlers.PATCH) methods.push({ method: 'PATCH', handler: route.handlers.PATCH });
      if (route.handlers.OPTIONS) methods.push({ method: 'OPTIONS', handler: route.handlers.OPTIONS });
      if (route.handlers.HEAD) methods.push({ method: 'HEAD', handler: route.handlers.HEAD });

      for (const { method, handler } of methods) {
        adapter.registerRoute(method, transformedPath, handler);
        registeredMethods.push(method.toLowerCase());
        logger.logHandler(method, transformedPath);
      }

      if (route.handlers.default) {
        adapter.registerDefaultHandler(transformedPath, route.handlers.default, registeredMethods);
        logger.logHandler(registeredMethods.length > 0 ? 'default' : 'ALL', transformedPath, true);
      }
    }
  }
}
