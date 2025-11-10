import { describe, it, expect } from 'vitest';
import { createExpressRouter, ExpressAdapter } from '../src/index.js';

describe('fs-router-express', () => {
  it('should export createExpressRouter function', () => {
    expect(typeof createExpressRouter).toBe('function');
  });

  it('should export ExpressAdapter class', () => {
    expect(typeof ExpressAdapter).toBe('function');
  });
});
