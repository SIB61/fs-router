# @fs-router/koa

Koa adapter for **Universal FS Router**.

## Installation

```bash
pnpm add @fs-router/koa
```

## Usage

```typescript
import Koa from 'koa';
import Router from '@koa/router';
import { useFsRouter } from '@fs-router/koa';

const app = new Koa();
const router = new Router();

await useFsRouter(router, {
  routesDir: './routes'
});

app.use(router.routes());
app.listen(3000);
```

## File Naming

- `route.ts` -> `/`
- `users.route.ts` -> `/users`
- `users/[id].route.ts` -> `/users/:id`
- `posts/[...slug].route.ts` -> `/posts/*`
- `posts.[postid].route.ts` -> `/posts/:postid`

## Example Route

```typescript
import type { Context } from 'koa';

export const GET = (ctx: Context) => {
  ctx.body = { message: 'Hello from Koa!' };
};

export const POST = (ctx: Context) => {
  ctx.body = { received: ctx.request.body };
};
```
