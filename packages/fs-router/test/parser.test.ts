import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parseRoutes, loadRouteHandlers } from '../src/parser.js';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('parseRoutes', () => {
  let testDir: string;

  beforeAll(() => {
    testDir = join(tmpdir(), `fs-router-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('Basic route parsing', () => {
    it('should parse a simple route file', () => {
      const routePath = join(testDir, 'users.route.ts');
      writeFileSync(routePath, 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users');
      expect(routes[0].isMiddleware).toBe(false);
    });

    it('should parse route files with .route.js extension', () => {
      const testDir2 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir2, { recursive: true });
      
      const routePath = join(testDir2, 'api.route.js');
      writeFileSync(routePath, 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir2);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api');
      
      rmSync(testDir2, { recursive: true, force: true });
    });

    it('should handle nested routes', () => {
      const testDir3 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir3, { recursive: true });
      mkdirSync(join(testDir3, 'api', 'v1'), { recursive: true });
      
      const routePath = join(testDir3, 'api', 'v1', 'users.route.ts');
      writeFileSync(routePath, 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir3);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api/v1/users');
      
      rmSync(testDir3, { recursive: true, force: true });
    });

    it('should parse index routes', () => {
      const testDir4 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir4, { recursive: true });
      
      const routePath = join(testDir4, 'index.route.ts');
      writeFileSync(routePath, 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir4);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/index');
      
      rmSync(testDir4, { recursive: true, force: true });
    });
  });

  describe('Dynamic route parameters', () => {
    it('should parse dynamic parameter routes', () => {
      const testDir5 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir5, { recursive: true });
      
      const routePath = join(testDir5, '[id].route.ts');
      writeFileSync(routePath, 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir5);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/:id');
      expect(routes[0].paramNames).toEqual(['id']);
      
      rmSync(testDir5, { recursive: true, force: true });
    });

    it('should parse multiple parameters', () => {
      const testDir6 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir6, { recursive: true });
      mkdirSync(join(testDir6, 'users'), { recursive: true });
      
      const routePath = join(testDir6, 'users', '[userId].posts.[postId].route.ts');
      writeFileSync(routePath, 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir6);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users/:userId/posts/:postId');
      expect(routes[0].paramNames).toEqual(['userId', 'postId']);
      
      rmSync(testDir6, { recursive: true, force: true });
    });


    it('should handle mixed static and dynamic segments', () => {
      const testDir8 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir8, { recursive: true });
      mkdirSync(join(testDir8, 'api'), { recursive: true });
      
      const routePath = join(testDir8, 'api', 'users.[id].profile.route.ts');
      writeFileSync(routePath, 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir8);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api/users/:id/profile');
      expect(routes[0].paramNames).toEqual(['id']);
      
      rmSync(testDir8, { recursive: true, force: true });
    });
  });

  describe('Middleware parsing', () => {
    it('should parse middleware files', () => {
      const testDir9 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir9, { recursive: true });
      
      const middlewarePath = join(testDir9, 'auth.middleware.ts');
      writeFileSync(middlewarePath, 'export default () => {};');
      
      const routes = parseRoutes(testDir9);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/auth/*');
      expect(routes[0].isMiddleware).toBe(true);
      
      rmSync(testDir9, { recursive: true, force: true });
    });

    it('should parse middleware files with .middleware.js extension', () => {
      const testDir10 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir10, { recursive: true });
      
      const middlewarePath = join(testDir10, 'logger.middleware.js');
      writeFileSync(middlewarePath, 'export default () => {};');
      
      const routes = parseRoutes(testDir10);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/logger/*');
      expect(routes[0].isMiddleware).toBe(true);
      
      rmSync(testDir10, { recursive: true, force: true });
    });

    it('should handle nested middleware', () => {
      const testDir11 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir11, { recursive: true });
      mkdirSync(join(testDir11, 'api'), { recursive: true });
      
      const middlewarePath = join(testDir11, 'api', 'auth.middleware.ts');
      writeFileSync(middlewarePath, 'export default () => {};');
      
      const routes = parseRoutes(testDir11);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api/auth/*');
      expect(routes[0].isMiddleware).toBe(true);
      
      rmSync(testDir11, { recursive: true, force: true });
    });

    it('should sort middleware before routes', () => {
      const testDir12 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir12, { recursive: true });
      
      writeFileSync(join(testDir12, 'users.route.ts'), 'export const GET = () => {};');
      writeFileSync(join(testDir12, 'auth.middleware.ts'), 'export default () => {};');
      writeFileSync(join(testDir12, 'posts.route.ts'), 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir12);
      
      expect(routes).toHaveLength(3);
      expect(routes[0].isMiddleware).toBe(true);
      expect(routes[1].isMiddleware).toBe(false);
      expect(routes[2].isMiddleware).toBe(false);
      
      rmSync(testDir12, { recursive: true, force: true });
    });
  });

  describe('Route sorting', () => {
    it('should sort routes by depth (deeper first)', () => {
      const testDir13 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir13, { recursive: true });
      mkdirSync(join(testDir13, 'api', 'v1'), { recursive: true });
      
      writeFileSync(join(testDir13, 'users.route.ts'), 'export const GET = () => {};');
      writeFileSync(join(testDir13, 'api', 'v1', 'products.route.ts'), 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir13);
      
      const userIndex = routes.findIndex(r => r.path === '/users');
      const productIndex = routes.findIndex(r => r.path === '/api/v1/products');
      
      expect(productIndex).toBeLessThan(userIndex);
      
      rmSync(testDir13, { recursive: true, force: true });
    });

    it('should sort routes alphabetically at the same depth', () => {
      const testDir14 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir14, { recursive: true });
      
      writeFileSync(join(testDir14, 'zebra.route.ts'), 'export const GET = () => {};');
      writeFileSync(join(testDir14, 'apple.route.ts'), 'export const GET = () => {};');
      writeFileSync(join(testDir14, 'mango.route.ts'), 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir14);
      
      const paths = routes.map(r => r.path);
      const sorted = [...paths].sort((a, b) => b.localeCompare(a));
      
      expect(paths).toEqual(sorted);
      
      rmSync(testDir14, { recursive: true, force: true });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty directory', () => {
      const testDir15 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir15, { recursive: true });
      
      const routes = parseRoutes(testDir15);
      
      expect(routes).toHaveLength(0);
      
      rmSync(testDir15, { recursive: true, force: true });
    });

    it('should ignore non-route files', () => {
      const testDir16 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir16, { recursive: true });
      
      writeFileSync(join(testDir16, 'users.route.ts'), 'export const GET = () => {};');
      writeFileSync(join(testDir16, 'config.ts'), 'export const config = {};');
      writeFileSync(join(testDir16, 'utils.js'), 'export const utils = {};');
      
      const routes = parseRoutes(testDir16);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users');
      
      rmSync(testDir16, { recursive: true, force: true });
    });

    it('should handle multiple slashes correctly', () => {
      const testDir17 = join(tmpdir(), `fs-router-test-${Date.now()}`);
      mkdirSync(testDir17, { recursive: true });
      
      const routePath = join(testDir17, 'test.route.ts');
      writeFileSync(routePath, 'export const GET = () => {};');
      
      const routes = parseRoutes(testDir17);
      
      expect(routes[0].path).toBe('/test');
      expect(routes[0].path).not.toContain('//');
      
      rmSync(testDir17, { recursive: true, force: true });
    });
  });
});

describe('loadRouteHandlers', () => {
  let testDir: string;

  beforeAll(() => {
    testDir = join(tmpdir(), `fs-router-test-handlers-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should load GET handler', async () => {
    const routePath = join(testDir, 'get-test.route.ts');
    writeFileSync(routePath, 'export const GET = () => "GET response";');
    
    const routes = parseRoutes(testDir);
    const loadedRoute = await loadRouteHandlers(routes[0]);
    
    expect(loadedRoute.handlers.GET).toBeDefined();
    expect(typeof loadedRoute.handlers.GET).toBe('function');
  });

  it('should load multiple HTTP method handlers', async () => {
    const testDir2 = join(tmpdir(), `fs-router-test-multi-${Date.now()}`);
    mkdirSync(testDir2, { recursive: true });
    
    const routePath = join(testDir2, 'multi.route.ts');
    writeFileSync(routePath, `
      export const GET = () => "GET";
      export const POST = () => "POST";
      export const PUT = () => "PUT";
      export const DELETE = () => "DELETE";
      export const PATCH = () => "PATCH";
    `);
    
    const routes = parseRoutes(testDir2);
    const loadedRoute = await loadRouteHandlers(routes[0]);
    
    expect(loadedRoute.handlers.GET).toBeDefined();
    expect(loadedRoute.handlers.POST).toBeDefined();
    expect(loadedRoute.handlers.PUT).toBeDefined();
    expect(loadedRoute.handlers.DELETE).toBeDefined();
    expect(loadedRoute.handlers.PATCH).toBeDefined();
    
    rmSync(testDir2, { recursive: true, force: true });
  });

  it('should load default handler', async () => {
    const testDir3 = join(tmpdir(), `fs-router-test-default-${Date.now()}`);
    mkdirSync(testDir3, { recursive: true });
    
    const routePath = join(testDir3, 'default.route.ts');
    writeFileSync(routePath, 'export default () => "default response";');
    
    const routes = parseRoutes(testDir3);
    const loadedRoute = await loadRouteHandlers(routes[0]);
    
    expect(loadedRoute.handlers.default).toBeDefined();
    expect(typeof loadedRoute.handlers.default).toBe('function');
    
    rmSync(testDir3, { recursive: true, force: true });
  });

  it('should load HEAD and OPTIONS handlers', async () => {
    const testDir4 = join(tmpdir(), `fs-router-test-head-${Date.now()}`);
    mkdirSync(testDir4, { recursive: true });
    
    const routePath = join(testDir4, 'headers.route.ts');
    writeFileSync(routePath, `
      export const HEAD = () => "HEAD";
      export const OPTIONS = () => "OPTIONS";
    `);
    
    const routes = parseRoutes(testDir4);
    const loadedRoute = await loadRouteHandlers(routes[0]);
    
    expect(loadedRoute.handlers.HEAD).toBeDefined();
    expect(loadedRoute.handlers.OPTIONS).toBeDefined();
    
    rmSync(testDir4, { recursive: true, force: true });
  });

  it('should handle routes with no exports', async () => {
    const testDir5 = join(tmpdir(), `fs-router-test-empty-${Date.now()}`);
    mkdirSync(testDir5, { recursive: true });
    
    const routePath = join(testDir5, 'empty.route.ts');
    writeFileSync(routePath, '');
    
    const routes = parseRoutes(testDir5);
    const loadedRoute = await loadRouteHandlers(routes[0]);
    
    expect(loadedRoute.handlers.GET).toBeUndefined();
    expect(loadedRoute.handlers.POST).toBeUndefined();
    expect(loadedRoute.handlers.default).toBeUndefined();
    
    rmSync(testDir5, { recursive: true, force: true });
  });
});
