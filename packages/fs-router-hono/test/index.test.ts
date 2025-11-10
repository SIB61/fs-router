import { describe, it, expect } from 'vitest';
import { createHonoRouter, HonoAdapter } from '../src/index.js';

describe('fs-router-hono', () => {
  it('should export createHonoRouter function', () => {
    expect(typeof createHonoRouter).toBe('function');
  });

  it('should export HonoAdapter class', () => {
    expect(typeof HonoAdapter).toBe('function');
  });
});
