import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../src/logger.js';

describe('createLogger', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('verbose mode enabled', () => {
    it('should log routes when verbose is true', () => {
      const logger = createLogger(true);
      logger.logRoute('Route', '/users', '/path/to/users.route.ts');

      expect(consoleLogSpy).toHaveBeenCalledWith('[fs-router] Route: /users -> /path/to/users.route.ts');
    });

    it('should log middleware when verbose is true', () => {
      const logger = createLogger(true);
      logger.logRoute('Middleware', '/auth/*', '/path/to/auth.middleware.ts');

      expect(consoleLogSpy).toHaveBeenCalledWith('[fs-router] Middleware: /auth/* -> /path/to/auth.middleware.ts');
    });

    it('should log handlers when verbose is true', () => {
      const logger = createLogger(true);
      logger.logHandler('GET', '/users');

      expect(consoleLogSpy).toHaveBeenCalledWith('  ↳ GET /users');
    });

    it('should log default handlers when verbose is true', () => {
      const logger = createLogger(true);
      logger.logHandler('default', '/users', true);

      expect(consoleLogSpy).toHaveBeenCalledWith('  ↳ DEFAULT /users (default handler)');
    });

    it('should uppercase method names', () => {
      const logger = createLogger(true);
      logger.logHandler('post', '/users');

      expect(consoleLogSpy).toHaveBeenCalledWith('  ↳ POST /users');
    });
  });

  describe('verbose mode disabled', () => {
    it('should not log routes when verbose is false', () => {
      const logger = createLogger(false);
      logger.logRoute('Route', '/users', '/path/to/users.route.ts');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log handlers when verbose is false', () => {
      const logger = createLogger(false);
      logger.logHandler('GET', '/users');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
