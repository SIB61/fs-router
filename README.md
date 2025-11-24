# Universal FS Router

**Universal FS Router** is a lightweight, framework-agnostic file-based routing library for Node.js, Bun, and Deno. It brings the developer experience of Next.js.js file-based routing to your favorite backend frameworks like Express, Fastify, Hono, and Koa. It's file name conventions are inspired from Next.js and Tasntack Router.

## Features

- 🚀 **Framework Agnostic**: Works with Express, Fastify, Hono, Koa, and more.
- 📂 **File-System Based**: Define routes by creating files (e.g., `users/[id].ts`).
- 🛠️ **TypeScript Support**: First-class TypeScript support with strict typing.
- ⚡ **Lightweight**: Minimal overhead, just a thin layer over your framework's router.
- 🔌 **Middleware Support**: Easy middleware integration via `.middleware.ts` files.

## Installation

```bash
# For Core (if building custom adapter)
pnpm add @fs-router/core

# For Specific Frameworks
pnpm add @fs-router/express
pnpm add @fs-router/fastify
pnpm add @fs-router/hono
pnpm add @fs-router/koa
```

## Usage

### Hono

```typescript
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono();

await useFsRouter(app, {
  routesDir: './routes'
});

export default app;
```

### Express

```typescript
import express from 'express';
import { useFsRouter } from '@fs-router/express';

const app = express();

await useFsRouter(app, {
  routesDir: './routes'
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Fastify

```typescript
import Fastify from 'fastify';
import { useFsRouter } from '@fs-router/fastify';

const fastify = Fastify();

await useFsRouter(fastify, {
  routesDir: './routes'
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('Server running on http://localhost:3000');
});
```

### Koa

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

## Route Definition

Create files in your `routes` directory:

- `route.ts` -> `/`
- `users.route.ts` -> `/users`
- `users/[id].route.ts` -> `/users/:id`
- `posts/[...slug].route.ts` -> `/posts/*`
- `posts.[postid].route.ts` -> `/posts/:postid`

**Example Route File (`routes/users/[id].route.ts`):**

```typescript
import type { Context } from 'hono'; // or Request, Response depending on framework

export const GET = (c: Context) => {
  const id = c.req.param('id');
  return c.json({ id, name: 'User' });
};

export const POST = async (c: Context) => {
  const body = await c.req.json();
  return c.json({ created: true, body });
};
```

## License

MIT
