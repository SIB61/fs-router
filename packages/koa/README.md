# @fs-router/koa

File-based routing for **Koa.js** - brings Next.js-style routing conventions to Koa with zero configuration.

[![npm version](https://badge.fury.io/js/%40fs-router%2Fkoa.svg)](https://badge.fury.io/js/%40fs-router%2Fkoa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 Zero Configuration
- 📂 File-System Based Routes
- 🛠️ Full TypeScript Support
- ⚡ Lightweight & Fast
- 🔌 Automatic Middleware Detection
- 🎯 Koa Native Routing (uses @koa/router)
- 🔄 Full Async/Await Support

## Installation

```bash
npm install @fs-router/koa @koa/router
# or
yarn add @fs-router/koa @koa/router
# or
pnpm add @fs-router/koa @koa/router
```

## Quick Start

```typescript
import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { useFsRouter } from '@fs-router/koa';

const app = new Koa();
const router = new Router();

app.use(bodyParser());

await useFsRouter(router, {
  routesDir: 'routes', // Use 'src/routes' if using src folder
  verbose: true
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
```

## Route Conventions

### File Structure to Routes

| File Path | Koa Route | Description |
|-----------|-----------|-------------|
| `route.ts` | `/` | Root route |
| `users.route.ts` | `/users` | Simple route |
| `users/[id].route.ts` | `/users/:id` | Dynamic parameter |
| `posts/[...slug].route.ts` | `/posts/*` | Catch-all route |
| `api/v1/users.route.ts` | `/api/v1/users` | Nested route |

### HTTP Method Handlers

Export async functions named after HTTP methods:

```typescript
// routes/users/[id].route.ts
import type { Context } from 'koa';

export const GET = async (ctx: Context) => {
  const { id } = ctx.params;
  const user = await db.users.findById(id);
  
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'Not found' };
    return;
  }
  
  ctx.body = { user };
};

export const POST = async (ctx: Context) => {
  const body = ctx.request.body;
  const user = await db.users.create(body);
  
  ctx.status = 201;
  ctx.body = { user };
};

export const DELETE = async (ctx: Context) => {
  const { id } = ctx.params;
  await db.users.delete(id);
  ctx.status = 204;
};

// Fallback for other methods
export default async (ctx: Context) => {
  ctx.status = 405;
  ctx.body = { error: 'Method not allowed' };
};
```

### Middleware Files

Create middleware with `.middleware.ts` suffix:

```typescript
// routes/auth.middleware.ts
import type { Context, Next } from 'koa';

export default async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized' };
    return;
  }
  
  try {
    const user = await verifyToken(token);
    ctx.state.user = user;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid token' };
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
export const GET = async (ctx: Context) => {
  try {
    const user = await db.users.findById(ctx.params.id);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    
    ctx.body = { user };
  } catch (error) {
    console.error('Error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal error' };
  }
};
```

### Catch-All Routes

```typescript
// routes/docs/[...path].route.ts
export const GET = async (ctx: Context) => {
  const path = ctx.params.rest || '';
  ctx.body = { documentation: `Docs for ${path}` };
};
```

### Request Validation

```typescript
// routes/users.route.ts
import Joi from 'joi';

const userSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
});

export const POST = async (ctx: Context) => {
  const { error, value } = userSchema.validate(ctx.request.body);
  
  if (error) {
    ctx.status = 400;
    ctx.body = { error: 'Validation failed', details: error.details };
    return;
  }
  
  const user = await db.users.create(value);
  ctx.status = 201;
  ctx.body = { user };
};
```

### Context State Management

```typescript
// types/koa.d.ts
declare module 'koa' {
  interface DefaultState {
    user?: { id: string; email: string };
  }
}

// routes/protected/profile.route.ts
export const GET = async (ctx: Context) => {
  const user = ctx.state.user; // Set by middleware
  const profile = await db.profiles.findById(user.id);
  ctx.body = { profile };
};
```

### Rate Limiting Middleware

```typescript
// routes/api/rate-limit.middleware.ts
const requests = new Map();

export default async (ctx: Context, next: Next) => {
  const ip = ctx.ip;
  const limit = 100;
  const window = 60000; // 1 minute
  
  const userRequests = requests.get(ip) || { count: 0, reset: Date.now() + window };
  
  if (Date.now() > userRequests.reset) {
    userRequests.count = 0;
    userRequests.reset = Date.now() + window;
  }
  
  if (userRequests.count >= limit) {
    ctx.status = 429;
    ctx.body = { error: 'Too many requests' };
    return;
  }
  
  userRequests.count++;
  requests.set(ip, userRequests);
  await next();
};
```

## API Reference

### `useFsRouter(router, options)`

```typescript
await useFsRouter(router, {
  routesDir: string;   // Required: Path to routes directory
  verbose?: boolean;   // Optional: Enable logging (default: false)
});
```

### `KoaAdapter`

For advanced usage with multiple routers:

```typescript
import { KoaAdapter } from '@fs-router/koa';
import { createRouter } from '@fs-router/core';

const apiRouter = new Router({ prefix: '/api' });
const adapter = new KoaAdapter(apiRouter);

await createRouter(adapter, {
  routesDir: 'api-routes',
  verbose: true
});

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());
```

## Integration with Koa Middleware

```typescript
import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import { useFsRouter } from '@fs-router/koa';

const app = new Koa();
const router = new Router();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser());

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
    console.error('Error:', err);
  }
});

// File-based routes
await useFsRouter(router, {
  routesDir: 'routes'
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
```

## Migration Guide

### Before (Koa Router)

```typescript
router.get('/users', async (ctx) => {
  ctx.body = { users: [] };
});

router.get('/users/:id', async (ctx) => {
  ctx.body = { id: ctx.params.id };
});
```

### After (FS Router)

```typescript
// routes/users.route.ts
export const GET = async (ctx) => {
  ctx.body = { users: [] };
};

// routes/users/[id].route.ts
export const GET = async (ctx) => {
  ctx.body = { id: ctx.params.id };
};
```

## Contributing

We welcome contributions! Please visit our [GitHub repository](https://github.com/sib61/fs-router) to:

- 🐛 [Report bugs](https://github.com/sib61/fs-router/issues)
- 💡 [Request features](https://github.com/sib61/fs-router/issues)
- 🔧 [Submit pull requests](https://github.com/sib61/fs-router/pulls)
- ⭐ Star the project if you find it useful!

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)
