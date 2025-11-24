import { describe, it, expect } from 'vitest';
import { useFsRouter, ExpressAdapter } from '../src/index.js';

describe('fs-router-express', () => {
  it('should export useFsRouter function', () => {
    expect(typeof useFsRouter).toBe('function');
  });

  it('should export ExpressAdapter class', () => {
    expect(typeof ExpressAdapter).toBe('function');
  });
});
