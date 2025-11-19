import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseRoutes, loadRouteHandlers } from '../src/parser.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('parseRoutes', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `fs-router-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should be a function', () => {
    expect(typeof parseRoutes).toBe('function');
  });

  describe('basic route parsing', () => {
    it('should parse index.route.ts as /', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'index.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/');
      expect(routes[0].isMiddleware).toBe(false);
    });

    it('should parse route.ts as /', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/');
      expect(routes[0].isMiddleware).toBe(false);
    });

    it('should parse users.route.ts as /users', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'users.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users');
    });

    it('should parse nested routes correctly', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'api.users.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api/users');
    });

    it('should parse route.ts in subdirectory', () => {
      const routesDir = join(testDir, 'routes');
      const apiDir = join(routesDir, 'api');
      mkdirSync(apiDir, { recursive: true });
      writeFileSync(join(apiDir, 'route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api');
    });

    it('should parse payments/route.ts same as payment.route.ts', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      
      const paymentsDir = join(routesDir, 'payments');
      mkdirSync(paymentsDir);
      writeFileSync(join(paymentsDir, 'route.ts'), 'export const GET = () => {}');

      const routes1 = parseRoutes(routesDir);
      
      rmSync(paymentsDir, { recursive: true });
      writeFileSync(join(routesDir, 'payments.route.ts'), 'export const GET = () => {}');
      
      const routes2 = parseRoutes(routesDir);
      
      expect(routes1[0].path).toBe(routes2[0].path);
      expect(routes1[0].path).toBe('/payments');
    });
  });

  describe('dynamic routes', () => {
    it('should parse [id] as :id parameter', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'users.[id].route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users/:id');
      expect(routes[0].paramNames).toEqual(['id']);
    });

    it('should parse multiple parameters', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'posts.[postId].comments.[commentId].route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/posts/:postId/comments/:commentId');
      expect(routes[0].paramNames).toEqual(['postId', 'commentId']);
    });

    it('should parse catch-all routes', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'files.[...path].route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/files/*');
      expect(routes[0].paramNames).toEqual(['path']);
    });

    it('should parse nested dynamic routes', () => {
      const routesDir = join(testDir, 'routes');
      const usersDir = join(routesDir, 'users');
      const settingsDir = join(usersDir, '[userid]', 'settings');
      mkdirSync(settingsDir, { recursive: true });
      writeFileSync(join(settingsDir, '[...rest].route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users/:userid/settings/*');
      expect(routes[0].paramNames).toEqual(['userid', 'rest']);
    });
  });

  describe('middleware', () => {
    it('should parse middleware files without catch-all', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'auth.middleware.ts'), 'export const default = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/auth');
      expect(routes[0].isMiddleware).toBe(true);
    });

    it('should parse middleware with catch-all parameter', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'user.[...userid].middleware.ts'), 'export const default = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/user/*');
      expect(routes[0].paramNames).toEqual(['userid']);
      expect(routes[0].isMiddleware).toBe(true);
    });

    it('should match route and middleware segment patterns', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'user.[...userid].route.ts'), 'export const GET = () => {}');
      writeFileSync(join(routesDir, 'user.[...userid].middleware.ts'), 'export const default = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(2);
      const middleware = routes.find(r => r.isMiddleware);
      const route = routes.find(r => !r.isMiddleware);
      expect(middleware?.path).toBe('/user/*');
      expect(route?.path).toBe('/user/*');
    });
  });

  describe('route sorting', () => {
    it('should sort middleware before routes', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'users.route.ts'), 'export const GET = () => {}');
      writeFileSync(join(routesDir, 'auth.middleware.ts'), 'export const default = () => {}');
      writeFileSync(join(routesDir, 'index.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(3);
      expect(routes[0].isMiddleware).toBe(true);
    });

    it('should sort routes by depth (deeper first)', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'users.route.ts'), 'export const GET = () => {}');
      writeFileSync(join(routesDir, 'users.[id].profile.route.ts'), 'export const GET = () => {}');
      writeFileSync(join(routesDir, 'index.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(3);
      const depths = routes.map(r => r.path.split('/').length);
      expect(depths[0]).toBeGreaterThanOrEqual(depths[1]);
      expect(depths[1]).toBeGreaterThanOrEqual(depths[2]);
    });
  });

  describe('file extensions', () => {
    it('should parse .js files', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'users.route.js'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users');
    });

    it('should parse route.js files', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'route.js'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/');
    });

    it('should parse .middleware.js files', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'auth.middleware.js'), 'export const default = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].isMiddleware).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty routes directory', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(0);
    });

    it('should ignore non-route files', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'utils.ts'), 'export const helper = () => {}');
      writeFileSync(join(routesDir, 'types.ts'), 'export type User = {}');
      writeFileSync(join(routesDir, 'users.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users');
    });

    it('should handle deeply nested directories', () => {
      const routesDir = join(testDir, 'routes');
      const deepDir = join(routesDir, 'api', 'v1', 'admin', 'users');
      mkdirSync(deepDir, { recursive: true });
      writeFileSync(join(deepDir, '[id].route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api/v1/admin/users/:id');
    });

    it('should handle mixed directory and dot notation', () => {
      const routesDir = join(testDir, 'routes');
      const apiDir = join(routesDir, 'api');
      mkdirSync(apiDir, { recursive: true });
      writeFileSync(join(apiDir, 'v1.users.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api/v1/users');
    });

    it('should normalize multiple slashes', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'index.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes[0].path).toBe('/');
      expect(routes[0].path).not.toContain('//');
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple routes with same prefix', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'api.users.route.ts'), 'export const GET = () => {}');
      writeFileSync(join(routesDir, 'api.posts.route.ts'), 'export const GET = () => {}');
      writeFileSync(join(routesDir, 'api.comments.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(3);
      expect(routes.map(r => r.path).sort()).toEqual([
        '/api/comments',
        '/api/posts',
        '/api/users'
      ]);
    });

    it('should handle combination of static and dynamic segments', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'api.v2.users.[id].profile.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api/v2/users/:id/profile');
      expect(routes[0].paramNames).toEqual(['id']);
    });

    it('should handle multiple parameters in same segment', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'users.[id].[role].route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users/:id/:role');
      expect(routes[0].paramNames).toEqual(['id', 'role']);
    });

    it('should handle catch-all without preceding segments', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, '[...all].route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('//*');
      expect(routes[0].paramNames).toEqual(['all']);
    });

    it('should stop processing after catch-all parameter', () => {
      const routesDir = join(testDir, 'routes');
      const catchDir = join(routesDir, 'files', '[...path]');
      mkdirSync(catchDir, { recursive: true });
      writeFileSync(join(catchDir, 'extra.route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      const catchAllRoute = routes.find(r => r.paramNames.includes('path'));
      expect(catchAllRoute).toBeDefined();
      expect(catchAllRoute!.path).not.toContain('extra');
    });

    it('should handle routes with only param names', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, '[userId].[postId].route.ts'), 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/:userId/:postId');
      expect(routes[0].paramNames).toEqual(['userId', 'postId']);
    });

    it('should return parsed route properties', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      const filePath = join(routesDir, 'users.route.ts');
      writeFileSync(filePath, 'export const GET = () => {}');

      const routes = parseRoutes(routesDir);
      
      expect(routes[0]).toHaveProperty('path');
      expect(routes[0]).toHaveProperty('pattern');
      expect(routes[0]).toHaveProperty('paramNames');
      expect(routes[0]).toHaveProperty('filePath');
      expect(routes[0]).toHaveProperty('handlers');
      expect(routes[0]).toHaveProperty('isMiddleware');
      expect(routes[0]).toHaveProperty('specificMethod');
      expect(routes[0].filePath).toBe(filePath);
    });

    it('should handle absolute paths', () => {
      const routesDir = join(testDir, 'routes');
      mkdirSync(routesDir);
      writeFileSync(join(routesDir, 'users.route.ts'), 'export const GET = () => {}');

      const absoluteDir = require('path').resolve(routesDir);
      const routes = parseRoutes(absoluteDir);
      
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users');
    });
  });
});

describe('loadRouteHandlers', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `fs-router-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should load route handlers from file', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    const routeFile = join(routesDir, 'users.route.ts');
    writeFileSync(routeFile, `
      export const GET = () => 'get';
      export const POST = () => 'post';
    `);

    const routes = parseRoutes(routesDir);
    const loadedRoute = await loadRouteHandlers(routes[0]);

    expect(loadedRoute.handlers.GET).toBeDefined();
    expect(loadedRoute.handlers.POST).toBeDefined();
    expect(typeof loadedRoute.handlers.GET).toBe('function');
    expect(typeof loadedRoute.handlers.POST).toBe('function');
  });

  it('should handle default export', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    const routeFile = join(routesDir, 'middleware.middleware.ts');
    writeFileSync(routeFile, `
      export default () => 'middleware';
    `);

    const routes = parseRoutes(routesDir);
    const loadedRoute = await loadRouteHandlers(routes[0]);

    expect(loadedRoute.handlers.default).toBeDefined();
    expect(typeof loadedRoute.handlers.default).toBe('function');
  });
});
