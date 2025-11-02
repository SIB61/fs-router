import { Hono } from 'hono';
import { parseRoutes, loadRouteHandlers } from 'fs-router';
import { join } from 'node:path';

async function setupApp() {
  const app = new Hono();
  const routes = parseRoutes(join(process.cwd(), 'packages/test-hono/routes'));
  
  for (const route of routes) {
    const loadedRoute = await loadRouteHandlers(route);
    
    if (loadedRoute.isMiddleware && loadedRoute.handlers.default) {
      app.use(loadedRoute.path + '/*', loadedRoute.handlers.default);
    }
  }
  
  return app;
}

describe('Hono Middleware Tests', () => {
  it('should apply logger middleware', async () => {
    const app = await setupApp();
    
    app.get('/test', (c) => {
      return c.json({ message: 'test' });
    });
    
    const response = await app.request('/test');
    expect(response.status).toBe(200);
  });

  it('should apply auth middleware and reject unauthorized requests', async () => {
    const app = await setupApp();
    
    app.get('/auth/protected', (c) => {
      return c.json({ message: 'protected' });
    });
    
    const response = await app.request('/auth/protected');
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should apply auth middleware and accept authorized requests', async () => {
    const app = await setupApp();
    
    app.get('/auth/protected', (c) => {
      return c.json({ message: 'protected' });
    });
    
    const response = await app.request('/auth/protected', {
      headers: {
        authorization: 'Bearer valid-token'
      }
    });
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('protected');
  });

  it('should apply api middleware and set headers', async () => {
    const app = await setupApp();
    
    app.get('/api/test', (c) => {
      return c.json({ message: 'api test' });
    });
    
    const response = await app.request('/api/test');
    expect(response.headers.get('x-api-version')).toBe('1.0');
    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
