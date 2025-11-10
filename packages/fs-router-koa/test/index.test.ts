import { describe, it, expect } from 'vitest';
import { createKoaRouter, KoaAdapter } from '../src/index.js';

describe('fs-router-koa', () => {
  it('should export createKoaRouter function', () => {
    expect(typeof createKoaRouter).toBe('function');
  });

  it('should export KoaAdapter class', () => {
    expect(typeof KoaAdapter).toBe('function');
  });
});
