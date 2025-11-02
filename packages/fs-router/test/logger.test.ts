import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../src/logger.js';

describe('createLogger', () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('verbose mode', () => {
    it('should log route information when verbose is true', () => {
      const logger = createLogger(true);
      
      logger.logRoute('Route', '/users', '/path/to/users.route.ts');
      
      expect(consoleSpy).toHaveBeenCalledWith('[fs-router] Route: /users -> /path/to/users.route.ts');
    });

    it('should log middleware information when verbose is true', () => {
      const logger = createLogger(true);
      
      logger.logRoute('Middleware', '/auth/*', '/path/to/auth.middleware.ts');
      
      expect(consoleSpy).toHaveBeenCalledWith('[fs-router] Middleware: /auth/* -> /path/to/auth.middleware.ts');
    });

    it('should log handler information when verbose is true', () => {
      const logger = createLogger(true);
      
      logger.logHandler('GET', '/users');
      
      expect(consoleSpy).toHaveBeenCalledWith('  ↳ GET /users');
    });

    it('should log default handler with suffix', () => {
      const logger = createLogger(true);
      
      logger.logHandler('default', '/users', true);
      
      expect(consoleSpy).toHaveBeenCalledWith('  ↳ DEFAULT /users (default handler)');
    });

    it('should log ALL handler when specified', () => {
      const logger = createLogger(true);
      
      logger.logHandler('ALL', '/users', true);
      
      expect(consoleSpy).toHaveBeenCalledWith('  ↳ ALL /users (default handler)');
    });

    it('should uppercase HTTP methods', () => {
      const logger = createLogger(true);
      
      logger.logHandler('post', '/users');
      
      expect(consoleSpy).toHaveBeenCalledWith('  ↳ POST /users');
    });
  });

  describe('non-verbose mode', () => {
    it('should not log route information when verbose is false', () => {
      const logger = createLogger(false);
      
      logger.logRoute('Route', '/users', '/path/to/users.route.ts');
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should not log middleware information when verbose is false', () => {
      const logger = createLogger(false);
      
      logger.logRoute('Middleware', '/auth/*', '/path/to/auth.middleware.ts');
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should not log handler information when verbose is false', () => {
      const logger = createLogger(false);
      
      logger.logHandler('GET', '/users');
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should not log default handler when verbose is false', () => {
      const logger = createLogger(false);
      
      logger.logHandler('default', '/users', true);
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('multiple logs', () => {
    it('should handle multiple consecutive logs', () => {
      const logger = createLogger(true);
      
      logger.logRoute('Route', '/users', '/path/to/users.route.ts');
      logger.logHandler('GET', '/users');
      logger.logHandler('POST', '/users');
      
      expect(consoleSpy).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, '[fs-router] Route: /users -> /path/to/users.route.ts');
      expect(consoleSpy).toHaveBeenNthCalledWith(2, '  ↳ GET /users');
      expect(consoleSpy).toHaveBeenNthCalledWith(3, '  ↳ POST /users');
    });
  });
});
