import { describe, it, expect } from 'vitest';
import { useFsRouter, KoaAdapter } from '../src/index.js';

describe('fs-router-koa', () => {
  it('should export useFsRouter function', () => {
    expect(typeof useFsRouter).toBe('function');
  });

  it('should export KoaAdapter class', () => {
    expect(typeof KoaAdapter).toBe('function');
  });
});
