import express from 'express';
import request from 'supertest';
import { parseRoutes, loadRouteHandlers } from 'fs-router';
import { join } from 'node:path';

async function setupApp() {
  const app = express();
  const routes = parseRoutes(join(process.cwd(), 'packages/test-express/routes'));
  
  for (const route of routes) {
    const loadedRoute = await loadRouteHandlers(route);
    
    if (loadedRoute.isMiddleware && loadedRoute.handlers.default) {
      app.use(loadedRoute.path, loadedRoute.handlers.default);
    }
  }
  
  return app;
}

describe('Express Middleware Tests', () => {
  it('should apply logger middleware', async () => {
    const app = await setupApp();
    
    app.get('/test', (req, res) => {
      res.json({ message: 'test' });
    });
    
    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
  });

  it('should apply auth middleware and reject unauthorized requests', async () => {
    const app = await setupApp();
    
    app.get('/auth/protected', (req, res) => {
      res.json({ message: 'protected' });
    });
    
    const response = await request(app).get('/auth/protected');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  it('should apply auth middleware and accept authorized requests', async () => {
    const app = await setupApp();
    
    app.get('/auth/protected', (req, res) => {
      res.json({ message: 'protected' });
    });
    
    const response = await request(app)
      .get('/auth/protected')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('protected');
  });

  it('should apply api middleware and set headers', async () => {
    const app = await setupApp();
    
    app.get('/api/test', (req, res) => {
      res.json({ message: 'api test' });
    });
    
    const response = await request(app).get('/api/test');
    expect(response.headers['x-api-version']).toBe('1.0');
    expect(response.headers['content-type']).toContain('application/json');
  });
});
