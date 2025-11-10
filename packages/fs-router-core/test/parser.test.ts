import { describe, it, expect } from 'vitest';
import { parseRoutes } from '../src/parser.js';

describe('parseRoutes', () => {
  it('should be a function', () => {
    expect(typeof parseRoutes).toBe('function');
  });
});
