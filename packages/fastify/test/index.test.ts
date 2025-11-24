import { describe, it, expect } from 'vitest';
import { useFsRouter, FastifyAdapter } from '../src/index.js';

describe('fs-router-fastify', () => {
  it('should export useFsRouter function', () => {
    expect(typeof useFsRouter).toBe('function');
  });

  it('should export FastifyAdapter class', () => {
    expect(typeof FastifyAdapter).toBe('function');
  });
});
