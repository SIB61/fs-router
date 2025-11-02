import { describe, it, expect, vi } from 'vitest';
import { KoaAdapter } from '../../src/adapters/koa.js';

describe('KoaAdapter', () => {
  describe('registerMiddleware', () => {
    it('should register middleware using router.use', () => {
      const mockRouter: any = {
        use: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerMiddleware('/api/*', handler);
      
      expect(mockRouter.use).toHaveBeenCalledWith('/api/*', handler);
    });
  });

  describe('registerRoute', () => {
    it('should register GET route with async wrapper', () => {
      const mockRouter: any = {
        get: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerRoute('GET', '/users', handler);
      
      expect(mockRouter.get).toHaveBeenCalledWith('/users', expect.any(Function));
    });

    it('should call handler with context', async () => {
      const mockRouter: any = {
        get: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerRoute('GET', '/users', handler);
      
      const wrappedHandler = mockRouter.get.mock.calls[0][1];
      const mockCtx = { path: '/users', method: 'GET' };
      
      await wrappedHandler(mockCtx);
      
      expect(handler).toHaveBeenCalledWith(mockCtx);
    });

    it('should register POST route', () => {
      const mockRouter: any = {
        post: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerRoute('POST', '/users', handler);
      
      expect(mockRouter.post).toHaveBeenCalledWith('/users', expect.any(Function));
    });

    it('should register PUT route', () => {
      const mockRouter: any = {
        put: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerRoute('PUT', '/users/:id', handler);
      
      expect(mockRouter.put).toHaveBeenCalledWith('/users/:id', expect.any(Function));
    });

    it('should register DELETE route', () => {
      const mockRouter: any = {
        delete: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerRoute('DELETE', '/users/:id', handler);
      
      expect(mockRouter.delete).toHaveBeenCalledWith('/users/:id', expect.any(Function));
    });

    it('should register PATCH route', () => {
      const mockRouter: any = {
        patch: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerRoute('PATCH', '/users/:id', handler);
      
      expect(mockRouter.patch).toHaveBeenCalledWith('/users/:id', expect.any(Function));
    });

    it('should register OPTIONS route', () => {
      const mockRouter: any = {
        options: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerRoute('OPTIONS', '/users', handler);
      
      expect(mockRouter.options).toHaveBeenCalledWith('/users', expect.any(Function));
    });

    it('should register HEAD route', () => {
      const mockRouter: any = {
        head: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerRoute('HEAD', '/users', handler);
      
      expect(mockRouter.head).toHaveBeenCalledWith('/users', expect.any(Function));
    });
  });

  describe('registerDefaultHandler', () => {
    it('should register unhandled methods using router.register', () => {
      const mockRouter: any = {
        register: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, ['GET', 'POST']);
      
      expect(mockRouter.register).toHaveBeenCalledWith('/users', ['PUT'], expect.any(Function));
      expect(mockRouter.register).toHaveBeenCalledWith('/users', ['DELETE'], expect.any(Function));
      expect(mockRouter.register).toHaveBeenCalledWith('/users', ['PATCH'], expect.any(Function));
      expect(mockRouter.register).toHaveBeenCalledWith('/users', ['OPTIONS'], expect.any(Function));
      expect(mockRouter.register).toHaveBeenCalledWith('/users', ['HEAD'], expect.any(Function));
    });

    it('should call handler with context in default handler', async () => {
      const mockRouter: any = {
        register: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, ['GET']);
      
      const firstCall = mockRouter.register.mock.calls[0];
      const wrappedHandler = firstCall[2];
      const mockCtx = { path: '/users', method: 'POST' };
      
      await wrappedHandler(mockCtx);
      
      expect(handler).toHaveBeenCalledWith(mockCtx);
    });

    it('should handle registered methods correctly', () => {
      const mockRouter: any = {
        register: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, ['GET', 'POST']);
      
      const calls = mockRouter.register.mock.calls;
      const registeredMethods = calls.map((call: any) => call[1][0]);
      
      expect(registeredMethods).not.toContain('GET');
      expect(registeredMethods).not.toContain('POST');
      expect(registeredMethods).toContain('PUT');
      expect(registeredMethods).toContain('DELETE');
    });

    it('should register all methods when none are registered', () => {
      const mockRouter: any = {
        register: vi.fn()
      };
      const adapter = new KoaAdapter(mockRouter);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, []);
      
      expect(mockRouter.register).toHaveBeenCalledTimes(7);
      
      const registeredMethods = mockRouter.register.mock.calls.map((call: any) => call[1][0]);
      expect(registeredMethods).toContain('GET');
      expect(registeredMethods).toContain('POST');
      expect(registeredMethods).toContain('PUT');
      expect(registeredMethods).toContain('DELETE');
      expect(registeredMethods).toContain('PATCH');
      expect(registeredMethods).toContain('OPTIONS');
      expect(registeredMethods).toContain('HEAD');
    });
  });

  describe('transformPath', () => {
    it('should return path unchanged', () => {
      const mockRouter: any = {};
      const adapter = new KoaAdapter(mockRouter);
      
      const result = adapter.transformPath('/api/users/:id');
      
      expect(result).toBe('/api/users/:id');
    });

    it('should preserve wildcard patterns', () => {
      const mockRouter: any = {};
      const adapter = new KoaAdapter(mockRouter);
      
      const result = adapter.transformPath('/api/*');
      
      expect(result).toBe('/api/*');
    });
  });
});
