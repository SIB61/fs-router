import { describe, it, expect, vi } from 'vitest';
import { FastifyAdapter } from '../../src/adapters/fastify.js';

describe('FastifyAdapter', () => {
  describe('registerMiddleware', () => {
    it('should register middleware using addHook', () => {
      const mockApp: any = {
        addHook: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerMiddleware('/api/*', handler);
      
      expect(mockApp.addHook).toHaveBeenCalledWith('onRequest', expect.any(Function));
    });

    it('should strip trailing /* from middleware path', async () => {
      const mockApp: any = {
        addHook: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerMiddleware('/api/*', handler);
      
      const hookHandler = mockApp.addHook.mock.calls[0][1];
      const mockRequest = { url: '/api/users' };
      const mockReply = {};
      
      await hookHandler(mockRequest, mockReply);
      
      expect(handler).toHaveBeenCalledWith(mockRequest, mockReply);
    });

    it('should not call handler for non-matching paths', async () => {
      const mockApp: any = {
        addHook: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerMiddleware('/api/*', handler);
      
      const hookHandler = mockApp.addHook.mock.calls[0][1];
      const mockRequest = { url: '/other/path' };
      const mockReply = {};
      
      await hookHandler(mockRequest, mockReply);
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('registerRoute', () => {
    it('should register GET route', () => {
      const mockApp: any = {
        get: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('GET', '/users', handler);
      
      expect(mockApp.get).toHaveBeenCalledWith('/users', handler);
    });

    it('should register POST route', () => {
      const mockApp: any = {
        post: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('POST', '/users', handler);
      
      expect(mockApp.post).toHaveBeenCalledWith('/users', handler);
    });

    it('should register PUT route', () => {
      const mockApp: any = {
        put: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('PUT', '/users/:id', handler);
      
      expect(mockApp.put).toHaveBeenCalledWith('/users/:id', handler);
    });

    it('should register DELETE route', () => {
      const mockApp: any = {
        delete: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('DELETE', '/users/:id', handler);
      
      expect(mockApp.delete).toHaveBeenCalledWith('/users/:id', handler);
    });

    it('should register PATCH route', () => {
      const mockApp: any = {
        patch: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('PATCH', '/users/:id', handler);
      
      expect(mockApp.patch).toHaveBeenCalledWith('/users/:id', handler);
    });
  });

  describe('registerDefaultHandler', () => {
    it('should use app.all when no methods registered', () => {
      const mockApp: any = {
        all: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, []);
      
      expect(mockApp.all).toHaveBeenCalledWith('/users', handler);
    });

    it('should register unhandled methods using app.route', () => {
      const mockApp: any = {
        route: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, ['GET', 'POST']);
      
      expect(mockApp.route).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/users',
        handler
      });
      expect(mockApp.route).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/users',
        handler
      });
      expect(mockApp.route).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/users',
        handler
      });
      expect(mockApp.route).toHaveBeenCalledWith({
        method: 'OPTIONS',
        url: '/users',
        handler
      });
    });

    it('should exclude HEAD when GET is registered', () => {
      const mockApp: any = {
        route: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, ['GET']);
      
      const calls = mockApp.route.mock.calls.map((call: any) => call[0].method);
      expect(calls).not.toContain('HEAD');
      expect(calls).toContain('POST');
      expect(calls).toContain('PUT');
      expect(calls).toContain('DELETE');
    });

    it('should include HEAD when GET is not registered', () => {
      const mockApp: any = {
        route: vi.fn()
      };
      const adapter = new FastifyAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, ['POST']);
      
      const calls = mockApp.route.mock.calls.map((call: any) => call[0].method);
      expect(calls).toContain('HEAD');
      expect(calls).toContain('GET');
    });
  });

  describe('transformPath', () => {
    it('should return path unchanged', () => {
      const mockApp: any = {};
      const adapter = new FastifyAdapter(mockApp);
      
      const result = adapter.transformPath('/api/users/:id');
      
      expect(result).toBe('/api/users/:id');
    });

    it('should preserve wildcard patterns', () => {
      const mockApp: any = {};
      const adapter = new FastifyAdapter(mockApp);
      
      const result = adapter.transformPath('/api/*');
      
      expect(result).toBe('/api/*');
    });
  });
});
