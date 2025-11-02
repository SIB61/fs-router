import { parseRoutes, loadRouteHandlers } from './parser.js';
export async function createFastifyRouter(app, options) {
    const routes = parseRoutes(options.routesDir);
    for (const route of routes) {
        await loadRouteHandlers(route);
        if (options.verbose) {
            console.log(`[fs-router] ${route.isMiddleware ? 'Middleware' : 'Route'}: ${route.path} -> ${route.filePath}`);
        }
        const fastifyPath = route.path;
        if (route.isMiddleware) {
            const handler = route.handlers.default || route.handlers.GET;
            if (handler) {
                app.addHook('onRequest', handler);
            }
        }
        else {
            if (route.handlers.GET) {
                app.get(fastifyPath, route.handlers.GET);
            }
            if (route.handlers.POST) {
                app.post(fastifyPath, route.handlers.POST);
            }
            if (route.handlers.PUT) {
                app.put(fastifyPath, route.handlers.PUT);
            }
            if (route.handlers.DELETE) {
                app.delete(fastifyPath, route.handlers.DELETE);
            }
            if (route.handlers.PATCH) {
                app.patch(fastifyPath, route.handlers.PATCH);
            }
            if (route.handlers.OPTIONS) {
                app.options(fastifyPath, route.handlers.OPTIONS);
            }
            if (route.handlers.HEAD) {
                app.head(fastifyPath, route.handlers.HEAD);
            }
            if (route.handlers.default) {
                app.all(fastifyPath, route.handlers.default);
            }
        }
    }
    return app;
}
//# sourceMappingURL=fastify.js.map