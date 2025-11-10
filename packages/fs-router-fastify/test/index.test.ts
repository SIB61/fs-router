import { describe, it, expect } from 'vitest';
import { createFastifyRouter, FastifyAdapter } from '../src/index.js';

describe('fs-router-fastify', () => {
  it('should export createFastifyRouter function', () => {
    expect(typeof createFastifyRouter).toBe('function');
  });

  it('should export FastifyAdapter class', () => {
    expect(typeof FastifyAdapter).toBe('function');
  });
});
