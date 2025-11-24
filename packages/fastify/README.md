# @fs-router/fastify

Fastify adapter for **Universal FS Router**.

## Installation

```bash
pnpm add @fs-router/fastify
```

## Usage

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

## File Naming

- `route.ts` -> `/`
- `users.route.ts` -> `/users`
- `users/[id].route.ts` -> `/users/:id`
- `posts/[...slug].route.ts` -> `/posts/*`
- `posts.[postid].route.ts` -> `/posts/:postid`

## Example Route

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify';

export const GET = async (request: FastifyRequest, reply: FastifyReply) => {
  return { message: 'Hello from Fastify!' };
};

export const POST = async (request: FastifyRequest, reply: FastifyReply) => {
  return { received: request.body };
};
```
