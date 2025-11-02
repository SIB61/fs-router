import Koa from 'koa';
import Router from '@koa/router';
import { createKoaRouter } from 'fs-router/koa';

const app = new Koa();
const router = new Router();

await createKoaRouter(router, { routesDir: './routes', verbose: true });

app.use(router.routes() as any);
app.use(router.allowedMethods() as any);

app.listen(3003, () => {
  console.log('Koa server running on http://localhost:3003');
});
