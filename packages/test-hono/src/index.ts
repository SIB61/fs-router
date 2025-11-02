import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createHonoRouter } from 'fs-router/hono';

const app = new Hono();

await createHonoRouter(app, { routesDir: './routes', verbose: true });

serve({ fetch: app.fetch, port: 3001 }, () => {
  console.log('Hono server running on http://localhost:3001');
});
