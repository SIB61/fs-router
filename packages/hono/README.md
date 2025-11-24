# @fs-router/hono

Hono adapter for **Universal FS Router**.

## Installation

```bash
pnpm add @fs-router/hono
```

## Usage

```typescript
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono();

await useFsRouter(app, {
  routesDir: './routes'
});

export default app;
```

## File Naming

- `route.ts` -> `/`
- `users.route.ts` -> `/users`
- `users/[id].route.ts` -> `/users/:id`
- `posts/[...slug].route.ts` -> `/posts/*`
- `posts.[postid].route.ts` -> `/posts/:postid`

## Example Route

```typescript
import type { Context } from 'hono';

export const GET = (c: Context) => {
  return c.json({ message: 'Hello from Hono!' });
};

export const POST = async (c: Context) => {
  const body = await c.req.json();
  return c.json({ received: body });
};
```
