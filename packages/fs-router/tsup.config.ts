import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    hono: 'src/hono.ts',
    express: 'src/express.ts',
    fastify: 'src/fastify.ts',
    koa: 'src/koa.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: false,
  esbuildOptions(options) {
    options.platform = 'neutral';
  },
});
