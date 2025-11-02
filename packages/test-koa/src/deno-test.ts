import Koa from 'npm:koa@^2.16.0';
import Router from 'npm:@koa/router@^13.1.0';
import { createKoaRouter } from '../../fs-router/dist/koa.mjs';

const app = new Koa();
const router = new Router();

await createKoaRouter(router, { routesDir: './routes', verbose: true });

app.use(router.routes() as any);
app.use(router.allowedMethods() as any);

console.log('Deno + Koa test completed successfully!');

Deno.exit(0);
