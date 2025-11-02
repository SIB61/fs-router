import { describe, it, expect, vi } from 'vitest';
import { HonoAdapter } from '../../src/adapters/hono.js';

describe('HonoAdapter', () => {
  describe('registerMiddleware', () => {
    it('should register middleware using app.use', () => {
      const mockApp: any = {
        use: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerMiddleware('/api/*', handler);
      
      expect(mockApp.use).toHaveBeenCalledWith('/api/*', handler);
    });
  });

  describe('registerRoute', () => {
    it('should register GET route', () => {
      const mockApp: any = {
        get: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('GET', '/users', handler);
      
      expect(mockApp.get).toHaveBeenCalledWith('/users', handler);
    });

    it('should register POST route', () => {
      const mockApp: any = {
        post: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('POST', '/users', handler);
      
      expect(mockApp.post).toHaveBeenCalledWith('/users', handler);
    });

    it('should register PUT route', () => {
      const mockApp: any = {
        put: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('PUT', '/users/:id', handler);
      
      expect(mockApp.put).toHaveBeenCalledWith('/users/:id', handler);
    });

    it('should register DELETE route', () => {
      const mockApp: any = {
        delete: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('DELETE', '/users/:id', handler);
      
      expect(mockApp.delete).toHaveBeenCalledWith('/users/:id', handler);
    });

    it('should register PATCH route', () => {
      const mockApp: any = {
        patch: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('PATCH', '/users/:id', handler);
      
      expect(mockApp.patch).toHaveBeenCalledWith('/users/:id', handler);
    });

    it('should register OPTIONS route', () => {
      const mockApp: any = {
        options: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('OPTIONS', '/users', handler);
      
      expect(mockApp.options).toHaveBeenCalledWith('/users', handler);
    });

    it('should register HEAD route using app.on', () => {
      const mockApp: any = {
        on: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('HEAD', '/users', handler);
      
      expect(mockApp.on).toHaveBeenCalledWith('HEAD', '/users', handler);
    });
  });

  describe('registerDefaultHandler', () => {
    it('should use app.all when no methods registered', () => {
      const mockApp: any = {
        all: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, []);
      
      expect(mockApp.all).toHaveBeenCalledWith('/users', handler);
    });

    it('should register unhandled methods when some methods are registered', () => {
      const mockApp: any = {
        on: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, ['GET', 'POST']);
      
      expect(mockApp.on).toHaveBeenCalledWith('PUT', '/users', handler);
      expect(mockApp.on).toHaveBeenCalledWith('DELETE', '/users', handler);
      expect(mockApp.on).toHaveBeenCalledWith('PATCH', '/users', handler);
      expect(mockApp.on).toHaveBeenCalledWith('OPTIONS', '/users', handler);
      expect(mockApp.on).toHaveBeenCalledWith('HEAD', '/users', handler);
      expect(mockApp.on).not.toHaveBeenCalledWith('GET', '/users', handler);
      expect(mockApp.on).not.toHaveBeenCalledWith('POST', '/users', handler);
    });

    it('should handle registered methods correctly', () => {
      const mockApp: any = {
        on: vi.fn()
      };
      const adapter = new HonoAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, ['GET', 'POST']);
      
      const calls = mockApp.on.mock.calls.map((call: any) => call[0]);
      expect(calls).not.toContain('GET');
      expect(calls).not.toContain('POST');
      expect(calls).toContain('PUT');
      expect(calls).toContain('DELETE');
    });
  });

  describe('transformPath', () => {
    it('should return path unchanged', () => {
      const mockApp: any = {};
      const adapter = new HonoAdapter(mockApp);
      
      const result = adapter.transformPath('/api/users/:id');
      
      expect(result).toBe('/api/users/:id');
    });

    it('should preserve wildcard patterns', () => {
      const mockApp: any = {};
      const adapter = new HonoAdapter(mockApp);
      
      const result = adapter.transformPath('/api/*');
      
      expect(result).toBe('/api/*');
    });
  });
});
