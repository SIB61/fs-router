import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRouter } from '../src/factory.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { FrameworkAdapter } from '../src/adapter.js';

describe('createRouter', () => {
  let testDir: string;
  let mockAdapter: FrameworkAdapter;

  beforeEach(() => {
    testDir = join(tmpdir(), `fs-router-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });

    mockAdapter = {
      registerMiddleware: vi.fn(),
      registerRoute: vi.fn(),
      registerDefaultHandler: vi.fn(),
      transformPath: (path: string) => path,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should register routes', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'users.route.ts'),
      'export const GET = () => "users";'
    );

    await createRouter(mockAdapter, { routesDir });

    expect(mockAdapter.registerRoute).toHaveBeenCalledWith(
      'GET',
      '/users',
      expect.any(Function)
    );
  });

  it('should register multiple HTTP methods', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'users.route.ts'),
      'export const GET = () => "get"; export const POST = () => "post";'
    );

    await createRouter(mockAdapter, { routesDir });

    expect(mockAdapter.registerRoute).toHaveBeenCalledWith(
      'GET',
      '/users',
      expect.any(Function)
    );
    expect(mockAdapter.registerRoute).toHaveBeenCalledWith(
      'POST',
      '/users',
      expect.any(Function)
    );
  });

  it('should register all HTTP methods', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'users.route.ts'),
      `
      export const GET = () => "get";
      export const POST = () => "post";
      export const PUT = () => "put";
      export const DELETE = () => "delete";
      export const PATCH = () => "patch";
      export const OPTIONS = () => "options";
      export const HEAD = () => "head";
      `
    );

    await createRouter(mockAdapter, { routesDir });

    expect(mockAdapter.registerRoute).toHaveBeenCalledWith('GET', '/users', expect.any(Function));
    expect(mockAdapter.registerRoute).toHaveBeenCalledWith('POST', '/users', expect.any(Function));
    expect(mockAdapter.registerRoute).toHaveBeenCalledWith('PUT', '/users', expect.any(Function));
    expect(mockAdapter.registerRoute).toHaveBeenCalledWith('DELETE', '/users', expect.any(Function));
    expect(mockAdapter.registerRoute).toHaveBeenCalledWith('PATCH', '/users', expect.any(Function));
    expect(mockAdapter.registerRoute).toHaveBeenCalledWith('OPTIONS', '/users', expect.any(Function));
    expect(mockAdapter.registerRoute).toHaveBeenCalledWith('HEAD', '/users', expect.any(Function));
  });

  it('should register middleware without wildcard', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'auth.middleware.ts'),
      'export default () => "middleware";'
    );

    await createRouter(mockAdapter, { routesDir });

    expect(mockAdapter.registerMiddleware).toHaveBeenCalledWith(
      '/auth',
      expect.any(Function)
    );
  });

  it('should register middleware with catch-all parameter', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'auth.[...path].middleware.ts'),
      'export default () => "middleware";'
    );

    await createRouter(mockAdapter, { routesDir });

    expect(mockAdapter.registerMiddleware).toHaveBeenCalledWith(
      '/auth/*',
      expect.any(Function)
    );
  });

  it('should use GET handler for middleware if default is missing', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'api.middleware.ts'),
      'export const GET = () => "middleware";'
    );

    await createRouter(mockAdapter, { routesDir });

    expect(mockAdapter.registerMiddleware).toHaveBeenCalledWith(
      '/api',
      expect.any(Function)
    );
  });

  it('should register default handler', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'users.route.ts'),
      'export const GET = () => "get"; export default () => "default";'
    );

    await createRouter(mockAdapter, { routesDir });

    expect(mockAdapter.registerDefaultHandler).toHaveBeenCalledWith(
      '/users',
      expect.any(Function),
      ['get']
    );
  });

  it('should register default handler when no methods are present', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'users.route.ts'),
      'export default () => "default";'
    );

    await createRouter(mockAdapter, { routesDir });

    expect(mockAdapter.registerDefaultHandler).toHaveBeenCalledWith(
      '/users',
      expect.any(Function),
      []
    );
  });

  it('should transform paths using adapter', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'users.route.ts'),
      'export const GET = () => "users";'
    );

    const transformingAdapter = {
      ...mockAdapter,
      transformPath: (path: string) => path.replace('/', '/api'),
    };

    await createRouter(transformingAdapter, { routesDir });

    expect(mockAdapter.registerRoute).toHaveBeenCalledWith(
      'GET',
      '/apiusers',
      expect.any(Function)
    );
  });

  it('should handle verbose logging', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'users.route.ts'),
      'export const GET = () => "users";'
    );

    await createRouter(mockAdapter, { routesDir, verbose: true });

    expect(consoleLogSpy).toHaveBeenCalled();
    consoleLogSpy.mockRestore();
  });

  it('should not log when verbose is false', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'users.route.ts'),
      'export const GET = () => "users";'
    );

    await createRouter(mockAdapter, { routesDir, verbose: false });

    expect(consoleLogSpy).not.toHaveBeenCalled();
    consoleLogSpy.mockRestore();
  });

  it('should handle dynamic routes', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(
      join(routesDir, 'users.[id].route.ts'),
      'export const GET = () => "user";'
    );

    await createRouter(mockAdapter, { routesDir });

    expect(mockAdapter.registerRoute).toHaveBeenCalledWith(
      'GET',
      '/users/:id',
      expect.any(Function)
    );
  });

  it('should process routes in correct order', async () => {
    const routesDir = join(testDir, 'routes');
    mkdirSync(routesDir);
    writeFileSync(join(routesDir, 'users.route.ts'), 'export const GET = () => "users";');
    writeFileSync(join(routesDir, 'auth.middleware.ts'), 'export default () => "auth";');

    const calls: string[] = [];
    const trackingAdapter = {
      ...mockAdapter,
      registerMiddleware: (path: string) => calls.push(`middleware:${path}`),
      registerRoute: (method: string, path: string) => calls.push(`route:${method}:${path}`),
    };

    await createRouter(trackingAdapter, { routesDir });

    expect(calls[0]).toContain('middleware');
  });
});
