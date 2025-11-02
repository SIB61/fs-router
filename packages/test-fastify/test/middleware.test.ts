import Fastify from 'fastify';
import { parseRoutes, loadRouteHandlers } from 'fs-router';
import { join } from 'node:path';

async function setupApp() {
  const app = Fastify();
  const routes = parseRoutes(join(process.cwd(), 'packages/test-fastify/routes'));
  
  for (const route of routes) {
    const loadedRoute = await loadRouteHandlers(route);
    
    if (loadedRoute.isMiddleware && loadedRoute.handlers.default) {
      app.addHook('onRequest', loadedRoute.handlers.default);
    }
  }
  
  return app;
}

describe('Fastify Middleware Tests', () => {
  it('should apply logger middleware', async () => {
    const app = await setupApp();
    
    app.get('/test', async (request, reply) => {
      return { message: 'test' };
    });
    
    const response = await app.inject({
      method: 'GET',
      url: '/test'
    });
    
    expect(response.statusCode).toBe(200);
  });

  it('should apply auth middleware and reject unauthorized requests', async () => {
    const app = await setupApp();
    
    app.get('/auth/protected', async (request, reply) => {
      return { message: 'protected' };
    });
    
    const response = await app.inject({
      method: 'GET',
      url: '/auth/protected'
    });
    
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).error).toBe('Unauthorized');
  });

  it('should apply auth middleware and accept authorized requests', async () => {
    const app = await setupApp();
    
    app.get('/auth/protected', async (request, reply) => {
      return { message: 'protected' };
    });
    
    const response = await app.inject({
      method: 'GET',
      url: '/auth/protected',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });
    
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('protected');
  });

  it('should apply api middleware and set headers', async () => {
    const app = await setupApp();
    
    app.get('/api/test', async (request, reply) => {
      return { message: 'api test' };
    });
    
    const response = await app.inject({
      method: 'GET',
      url: '/api/test'
    });
    
    expect(response.headers['x-api-version']).toBe('1.0');
    expect(response.headers['content-type']).toContain('application/json');
  });
});
