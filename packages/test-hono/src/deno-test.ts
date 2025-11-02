import { Hono } from 'npm:hono@^4.6.14';
import { createHonoRouter } from '../../fs-router/dist/hono.mjs';

const app = new Hono();

await createHonoRouter(app, { routesDir: './routes', verbose: true });

console.log('Deno + Hono test completed successfully!');
console.log('Routes registered:', app.routes.length);

Deno.exit(0);
