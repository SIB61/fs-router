# @fs-router/fastify

File-based routing for **Fastify** - brings Next.js-style routing conventions to Fastify with zero configuration.

[![npm version](https://badge.fury.io/js/%40fs-router%2Ffastify.svg)](https://badge.fury.io/js/%40fs-router%2Ffastify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 Zero Configuration
- 📂 File-System Based Routes
- 🛠️ Full TypeScript Support
- ⚡ High Performance
- 🔌 Automatic Middleware Detection
- 🎯 Fastify Native Routing
- 🔄 Full Async/Await Support

## Installation

```bash
npm install @fs-router/fastify
# or
yarn add @fs-router/fastify
# or
pnpm add @fs-router/fastify
```

## Quick Start

```typescript
import Fastify from 'fastify';
import { useFsRouter } from '@fs-router/fastify';

const fastify = Fastify({ logger: true });

await useFsRouter(fastify, {
  routesDir: 'routes', // Use 'src/routes' if using src folder
  verbose: true
});

await fastify.listen({ port: 3000 });
```

## Route Conventions

### File Structure to Routes

| File Path | Fastify Route | Description |
|-----------|---------------|-------------|
| `route.ts` | `/` | Root route |
| `users.route.ts` | `/users` | Simple route |
| `users/[id].route.ts` | `/users/:id` | Dynamic parameter |
| `posts/[...slug].route.ts` | `/posts/*` | Catch-all route |
| `api/v1/users.route.ts` | `/api/v1/users` | Nested route |

### HTTP Method Handlers

Export async functions named after HTTP methods:

```typescript
// routes/users/[id].route.ts
import type { FastifyRequest, FastifyReply } from 'fastify';

interface Params { id: string }
interface Body { name: string; email: string }

export const GET = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const user = await db.users.findById(id);
  
  if (!user) {
    return reply.code(404).send({ error: 'Not found' });
  }
  
  return { user };
};

export const POST = async (
  request: FastifyRequest<{ Params: Params; Body: Body }>,
  reply: FastifyReply
) => {
  const user = await db.users.create(request.body);
  return reply.code(201).send({ user });
};

export const DELETE = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply
) => {
  await db.users.delete(request.params.id);
  return reply.code(204).send();
};

// Fallback for other methods
export default async (request, reply) => {
  return reply.code(405).send({ error: 'Method not allowed' });
};
```

### Middleware Files

Create middleware with `.middleware.ts` suffix:

```typescript
// routes/auth.middleware.ts
import type { FastifyRequest, FastifyReply } from 'fastify';

export default async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.headers.authorization;
  
  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  
  try {
    const user = await verifyToken(token);
    request.user = user;
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
};
```

## Examples

### REST API Structure

```
routes/
├── api/
│   ├── auth/
│   │   ├── login.route.ts          # POST /api/auth/login
│   │   ├── register.route.ts       # POST /api/auth/register
│   │   └── [...rest].middleware.ts # Middleware for /api/auth/* (all auth routes)
│   ├── users/
│   │   ├── route.ts                # GET, POST /api/users
│   │   └── [id].route.ts           # GET, PUT, DELETE /api/users/:id
│   └── protected.middleware.ts     # Middleware for /api/protected only
└── health.route.ts                 # GET /health
```

### Error Handling

```typescript
// routes/users/[id].route.ts
export const GET = async (request, reply) => {
  try {
    const user = await db.users.findById(request.params.id);
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return { user };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal error' });
  }
};
```

### Catch-All Routes

```typescript
// routes/docs/[...path].route.ts
export const GET = async (request, reply) => {
  const path = request.params['*'] || '';
  return { documentation: `Docs for ${path}` };
};
```

### Rate Limiting Middleware

```typescript
// routes/api/rate-limit.middleware.ts
const requests = new Map();

export default async (request, reply) => {
  const ip = request.ip;
  const limit = 100;
  const window = 60000; // 1 minute
  
  const userRequests = requests.get(ip) || { count: 0, reset: Date.now() + window };
  
  if (Date.now() > userRequests.reset) {
    userRequests.count = 0;
    userRequests.reset = Date.now() + window;
  }
  
  if (userRequests.count >= limit) {
    return reply.code(429).send({ error: 'Too many requests' });
  }
  
  userRequests.count++;
  requests.set(ip, userRequests);
};
```

## API Reference

### `useFsRouter(fastify, options)`

```typescript
await useFsRouter(fastify, {
  routesDir: string;   // Required: Path to routes directory
  verbose?: boolean;   // Optional: Enable logging (default: false)
});
```

### `FastifyAdapter`

For advanced usage:

```typescript
import { FastifyAdapter } from '@fs-router/fastify';
import { createRouter } from '@fs-router/core';

const adapter = new FastifyAdapter(fastify);
await createRouter(adapter, {
  routesDir: 'routes',
  verbose: true
});
```

## Integration with Fastify Plugins

```typescript
import Fastify from 'fastify';
import { useFsRouter } from '@fs-router/fastify';

const fastify = Fastify({ logger: true });

// Register plugins
await fastify.register(import('@fastify/cors'));
await fastify.register(import('@fastify/helmet'));
await fastify.register(import('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
});

// File-based routes
await useFsRouter(fastify, {
  routesDir: 'routes'
});

await fastify.listen({ port: 3000 });
```

## Migration Guide

### Before (Fastify Routes)

```typescript
fastify.get('/users', async () => ({ users: [] }));
fastify.get('/users/:id', async (request) => ({ id: request.params.id }));
```

### After (FS Router)

```typescript
// routes/users.route.ts
export const GET = async () => ({ users: [] });

// routes/users/[id].route.ts
export const GET = async (request) => ({ id: request.params.id });
```

## Contributing

We welcome contributions! Please visit our [GitHub repository](https://github.com/sib61/fs-router) to:

- 🐛 [Report bugs](https://github.com/sib61/fs-router/issues)
- 💡 [Request features](https://github.com/sib61/fs-router/issues)
- 🔧 [Submit pull requests](https://github.com/sib61/fs-router/pulls)
- ⭐ Star the project if you find it useful!

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)
