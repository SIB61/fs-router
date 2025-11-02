import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRouter } from '../src/factory.js';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { FrameworkAdapter } from '../src/adapter.js';

describe('createRouter', () => {
  let testDir: string;
  let mockAdapter: FrameworkAdapter;

  beforeEach(() => {
    testDir = join(tmpdir(), `fs-router-factory-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    mockAdapter = {
      registerMiddleware: vi.fn(),
      registerRoute: vi.fn(),
      registerDefaultHandler: vi.fn(),
      transformPath: vi.fn((path: string) => path)
    };
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('Route registration', () => {
    it('should register a GET route', async () => {
      const routePath = join(testDir, 'users.route.ts');
      writeFileSync(routePath, 'export const GET = () => "users";');

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerRoute).toHaveBeenCalledWith(
        'GET',
        '/users',
        expect.any(Function)
      );
    });

    it('should register multiple HTTP methods', async () => {
      const routePath = join(testDir, 'posts.route.ts');
      writeFileSync(routePath, `
        export const GET = () => "get posts";
        export const POST = () => "create post";
        export const PUT = () => "update post";
        export const DELETE = () => "delete post";
      `);

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerRoute).toHaveBeenCalledWith('GET', '/posts', expect.any(Function));
      expect(mockAdapter.registerRoute).toHaveBeenCalledWith('POST', '/posts', expect.any(Function));
      expect(mockAdapter.registerRoute).toHaveBeenCalledWith('PUT', '/posts', expect.any(Function));
      expect(mockAdapter.registerRoute).toHaveBeenCalledWith('DELETE', '/posts', expect.any(Function));
    });

    it('should register PATCH, OPTIONS, and HEAD methods', async () => {
      const routePath = join(testDir, 'api.route.ts');
      writeFileSync(routePath, `
        export const PATCH = () => "patch";
        export const OPTIONS = () => "options";
        export const HEAD = () => "head";
      `);

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerRoute).toHaveBeenCalledWith('PATCH', '/api', expect.any(Function));
      expect(mockAdapter.registerRoute).toHaveBeenCalledWith('OPTIONS', '/api', expect.any(Function));
      expect(mockAdapter.registerRoute).toHaveBeenCalledWith('HEAD', '/api', expect.any(Function));
    });

    it('should register default handler', async () => {
      const routePath = join(testDir, 'default.route.ts');
      writeFileSync(routePath, 'export default () => "default handler";');

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerDefaultHandler).toHaveBeenCalledWith(
        '/default',
        expect.any(Function),
        []
      );
    });

    it('should register default handler with registered methods', async () => {
      const routePath = join(testDir, 'mixed.route.ts');
      writeFileSync(routePath, `
        export const GET = () => "get";
        export const POST = () => "post";
        export default () => "default";
      `);

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerDefaultHandler).toHaveBeenCalledWith(
        '/mixed',
        expect.any(Function),
        ['get', 'post']
      );
    });
  });

  describe('Middleware registration', () => {
    it('should register middleware', async () => {
      const middlewarePath = join(testDir, 'auth.middleware.ts');
      writeFileSync(middlewarePath, 'export default () => "auth middleware";');

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerMiddleware).toHaveBeenCalledWith(
        '/auth/*',
        expect.any(Function)
      );
    });

    it('should prefer default export for middleware', async () => {
      const middlewarePath = join(testDir, 'logger.middleware.ts');
      writeFileSync(middlewarePath, `
        export const GET = () => "get";
        export default () => "logger middleware";
      `);

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerMiddleware).toHaveBeenCalledWith(
        '/logger/*',
        expect.any(Function)
      );
    });

    it('should fallback to GET handler if no default export', async () => {
      const middlewarePath = join(testDir, 'fallback.middleware.ts');
      writeFileSync(middlewarePath, 'export const GET = () => "get middleware";');

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerMiddleware).toHaveBeenCalledWith(
        '/fallback/*',
        expect.any(Function)
      );
    });
  });

  describe('Path transformation', () => {
    it('should call transformPath for routes', async () => {
      const routePath = join(testDir, 'transform.route.ts');
      writeFileSync(routePath, 'export const GET = () => "test";');

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.transformPath).toHaveBeenCalledWith('/transform');
    });

    it('should call transformPath for middleware', async () => {
      const middlewarePath = join(testDir, 'transform.middleware.ts');
      writeFileSync(middlewarePath, 'export default () => "test";');

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.transformPath).toHaveBeenCalledWith('/transform/*');
    });
  });

  describe('Verbose mode', () => {
    it('should not log when verbose is false', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const routePath = join(testDir, 'silent.route.ts');
      writeFileSync(routePath, 'export const GET = () => "test";');

      await createRouter(mockAdapter, { routesDir: testDir, verbose: false });

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log when verbose is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const routePath = join(testDir, 'verbose.route.ts');
      writeFileSync(routePath, 'export const GET = () => "test";');

      await createRouter(mockAdapter, { routesDir: testDir, verbose: true });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Complex scenarios', () => {
    it('should handle nested routes', async () => {
      mkdirSync(join(testDir, 'api', 'v1'), { recursive: true });
      const routePath = join(testDir, 'api', 'v1', 'users.route.ts');
      writeFileSync(routePath, 'export const GET = () => "nested route";');

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerRoute).toHaveBeenCalledWith(
        'GET',
        '/api/v1/users',
        expect.any(Function)
      );
    });

    it('should handle dynamic parameters', async () => {
      const routePath = join(testDir, 'users.[id].route.ts');
      writeFileSync(routePath, 'export const GET = () => "dynamic route";');

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerRoute).toHaveBeenCalledWith(
        'GET',
        '/users/:id',
        expect.any(Function)
      );
    });

    it('should register middleware before routes', async () => {
      const calls: string[] = [];
      
      const trackingAdapter = {
        registerMiddleware: vi.fn(() => calls.push('middleware')),
        registerRoute: vi.fn(() => calls.push('route')),
        registerDefaultHandler: vi.fn(),
        transformPath: vi.fn((path: string) => path)
      };

      writeFileSync(join(testDir, 'users.route.ts'), 'export const GET = () => "route";');
      writeFileSync(join(testDir, 'auth.middleware.ts'), 'export default () => "middleware";');

      await createRouter(trackingAdapter, { routesDir: testDir });

      const firstMiddleware = calls.indexOf('middleware');
      const firstRoute = calls.indexOf('route');
      
      expect(firstMiddleware).toBeLessThan(firstRoute);
    });

    it('should handle multiple routes and middleware', async () => {
      writeFileSync(join(testDir, 'users.route.ts'), 'export const GET = () => {};');
      writeFileSync(join(testDir, 'posts.route.ts'), 'export const GET = () => {};');
      writeFileSync(join(testDir, 'auth.middleware.ts'), 'export default () => {};');
      writeFileSync(join(testDir, 'logger.middleware.ts'), 'export default () => {};');

      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerMiddleware).toHaveBeenCalledTimes(2);
      expect(mockAdapter.registerRoute).toHaveBeenCalledTimes(2);
    });

    it('should handle empty routes directory', async () => {
      await createRouter(mockAdapter, { routesDir: testDir });

      expect(mockAdapter.registerRoute).not.toHaveBeenCalled();
      expect(mockAdapter.registerMiddleware).not.toHaveBeenCalled();
    });
  });
});
