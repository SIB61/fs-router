import { describe, it, expect, vi } from 'vitest';
import { ExpressAdapter } from '../../src/adapters/express.js';

describe('ExpressAdapter', () => {
  describe('registerMiddleware', () => {
    it('should register middleware on the app', () => {
      const mockApp: any = {
        use: vi.fn()
      };
      const adapter = new ExpressAdapter(mockApp);
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
      const adapter = new ExpressAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('GET', '/users', handler);
      
      expect(mockApp.get).toHaveBeenCalledWith('/users', handler);
    });

    it('should register POST route', () => {
      const mockApp: any = {
        post: vi.fn()
      };
      const adapter = new ExpressAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('POST', '/users', handler);
      
      expect(mockApp.post).toHaveBeenCalledWith('/users', handler);
    });

    it('should register PUT route', () => {
      const mockApp: any = {
        put: vi.fn()
      };
      const adapter = new ExpressAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('PUT', '/users/:id', handler);
      
      expect(mockApp.put).toHaveBeenCalledWith('/users/:id', handler);
    });

    it('should register DELETE route', () => {
      const mockApp: any = {
        delete: vi.fn()
      };
      const adapter = new ExpressAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('DELETE', '/users/:id', handler);
      
      expect(mockApp.delete).toHaveBeenCalledWith('/users/:id', handler);
    });

    it('should register PATCH route', () => {
      const mockApp: any = {
        patch: vi.fn()
      };
      const adapter = new ExpressAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('PATCH', '/users/:id', handler);
      
      expect(mockApp.patch).toHaveBeenCalledWith('/users/:id', handler);
    });

    it('should register OPTIONS route', () => {
      const mockApp: any = {
        options: vi.fn()
      };
      const adapter = new ExpressAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('OPTIONS', '/users', handler);
      
      expect(mockApp.options).toHaveBeenCalledWith('/users', handler);
    });

    it('should register HEAD route', () => {
      const mockApp: any = {
        head: vi.fn()
      };
      const adapter = new ExpressAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerRoute('HEAD', '/users', handler);
      
      expect(mockApp.head).toHaveBeenCalledWith('/users', handler);
    });
  });

  describe('registerDefaultHandler', () => {
    it('should register handler for all unregistered methods', () => {
      const mockApp: any = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        options: vi.fn(),
        head: vi.fn()
      };
      const adapter = new ExpressAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, ['get', 'post']);
      
      expect(mockApp.get).not.toHaveBeenCalled();
      expect(mockApp.post).not.toHaveBeenCalled();
      expect(mockApp.put).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.delete).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.patch).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.options).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.head).toHaveBeenCalledWith('/users', handler);
    });

    it('should register handler for all methods when no methods registered', () => {
      const mockApp: any = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        options: vi.fn(),
        head: vi.fn()
      };
      const adapter = new ExpressAdapter(mockApp);
      const handler = vi.fn();
      
      adapter.registerDefaultHandler('/users', handler, []);
      
      expect(mockApp.get).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.post).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.put).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.delete).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.patch).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.options).toHaveBeenCalledWith('/users', handler);
      expect(mockApp.head).toHaveBeenCalledWith('/users', handler);
    });
  });

  describe('transformPath', () => {
    it('should preserve wildcard patterns', () => {
      const mockApp: any = {};
      const adapter = new ExpressAdapter(mockApp);
      
      const result = adapter.transformPath('/api/*');
      
      expect(result).toBe('/api/*');
    });

    it('should preserve parameter patterns', () => {
      const mockApp: any = {};
      const adapter = new ExpressAdapter(mockApp);
      
      const result = adapter.transformPath('/users/:id');
      
      expect(result).toBe('/users/:id');
    });

    it('should preserve regular paths', () => {
      const mockApp: any = {};
      const adapter = new ExpressAdapter(mockApp);
      
      const result = adapter.transformPath('/users');
      
      expect(result).toBe('/users');
    });
  });
});
