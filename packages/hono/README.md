# @fs-router/hono

File-based routing for **Hono** - brings Next.js-style routing conventions to Hono with zero configuration. Works on any JavaScript runtime.

[![npm version](https://badge.fury.io/js/%40fs-router%2Fhono.svg)](https://badge.fury.io/js/%40fs-router%2Fhono)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 Zero Configuration
- 📂 File-System Based Routes
- 🛠️ Full TypeScript Support
- ⚡ Ultra Fast Performance
- 🌐 Universal - Node.js, Bun, Deno, Cloudflare Workers, etc.
- 🔌 Automatic Middleware Detection
- 🎯 Hono Native Routing

## Installation

```bash
npm install @fs-router/hono
# or
yarn add @fs-router/hono
# or
pnpm add @fs-router/hono
```

## Quick Start

```typescript
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono();

await useFsRouter(app, {
  routesDir: 'routes', // Use 'src/routes' if using src folder
  verbose: true
});

export default app;
```

### Runtime-Specific Setup

**Node.js:**
```typescript
export default app;
```

**Bun:**
```typescript
export default {
  port: 3000,
  fetch: app.fetch,
};
```

**Deno:**
```typescript
Deno.serve(app.fetch);
```

**Cloudflare Workers:**
```typescript
export default app;
```

## Route Conventions

### File Structure to Routes

| File Path | Hono Route | Description |
|-----------|------------|-------------|
| `route.ts` | `/` | Root route |
| `users.route.ts` | `/users` | Simple route |
| `users/[id].route.ts` | `/users/:id` | Dynamic parameter |
| `posts/[...slug].route.ts` | `/posts/*` | Catch-all route |
| `api/v1/users.route.ts` | `/api/v1/users` | Nested route |

### HTTP Method Handlers

Export functions named after HTTP methods:

```typescript
// routes/users/[id].route.ts
import type { Context } from 'hono';

export const GET = async (c: Context) => {
  const id = c.req.param('id');
  const user = await db.users.findById(id);
  
  if (!user) {
    return c.json({ error: 'Not found' }, 404);
  }
  
  return c.json({ user });
};

export const POST = async (c: Context) => {
  const body = await c.req.json();
  const user = await db.users.create(body);
  return c.json({ user }, 201);
};

export const DELETE = async (c: Context) => {
  const id = c.req.param('id');
  await db.users.delete(id);
  return c.json({ deleted: true }, 204);
};

// Fallback for other methods
export default async (c: Context) => {
  return c.json({ error: 'Method not allowed' }, 405);
};
```

### Middleware Files

Create middleware with `.middleware.ts` suffix:

```typescript
// routes/auth.middleware.ts
import type { Context, Next } from 'hono';

export default async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const user = await verifyToken(token);
    c.set('user', user);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
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
import { HTTPException } from 'hono/http-exception';

export const GET = async (c: Context) => {
  try {
    const user = await db.users.findById(c.req.param('id'));
    
    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }
    
    return c.json({ user });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Internal error' });
  }
};
```

### Catch-All Routes

```typescript
// routes/docs/[...path].route.ts
export const GET = async (c: Context) => {
  const path = c.req.param('path') || '';
  return c.json({ documentation: `Docs for ${path}` });
};
```

### Validation with Zod

```typescript
// routes/users.route.ts
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const POST = async (c: Context) => {
  try {
    const body = await c.req.json();
    const data = userSchema.parse(body);
    const user = await db.users.create(data);
    return c.json({ user }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    throw error;
  }
};
```

### Context Variables

```typescript
// routes/protected/profile.route.ts
type Variables = { user: { id: string; email: string } };

export const GET = async (c: Context<{ Variables: Variables }>) => {
  const user = c.get('user'); // Set by auth middleware
  const profile = await db.profiles.findById(user.id);
  return c.json({ profile });
};
```

## API Reference

### `useFsRouter(app, options)`

```typescript
await useFsRouter(app, {
  routesDir: string;   // Required: Path to routes directory
  verbose?: boolean;   // Optional: Enable logging (default: false)
});
```

### `HonoAdapter`

For advanced usage:

```typescript
import { HonoAdapter } from '@fs-router/hono';
import { createRouter } from '@fs-router/core';

const adapter = new HonoAdapter(app);
await createRouter(adapter, {
  routesDir: 'routes',
  verbose: true
});
```

## Integration with Hono Middleware

```typescript
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', secureHeaders());

// File-based routes
await useFsRouter(app, {
  routesDir: 'routes'
});

export default app;
```

## Runtime Examples

### Cloudflare Workers

```typescript
// worker.ts
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

await useFsRouter(app, {
  routesDir: 'routes'
});

export default app;

// routes/api/data.route.ts
export const GET = async (c: Context<{ Bindings: Bindings }>) => {
  const result = await c.env.DB.prepare("SELECT * FROM users").all();
  return c.json(result);
};
```

### Deno Deploy

```typescript
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { useFsRouter } from 'npm:@fs-router/hono';

const app = new Hono();

await useFsRouter(app, {
  routesDir: 'routes'
});

Deno.serve(app.fetch);
```

## Migration Guide

### Before (Hono Routes)

```typescript
app.get('/users', (c) => c.json({ users: [] }));
app.get('/users/:id', (c) => c.json({ id: c.req.param('id') }));
```

### After (FS Router)

```typescript
// routes/users.route.ts
export const GET = (c) => c.json({ users: [] });

// routes/users/[id].route.ts
export const GET = (c) => c.json({ id: c.req.param('id') });
```

## Contributing

We welcome contributions! Please visit our [GitHub repository](https://github.com/sib61/fs-router) to:

- 🐛 [Report bugs](https://github.com/sib61/fs-router/issues)
- 💡 [Request features](https://github.com/sib61/fs-router/issues)
- 🔧 [Submit pull requests](https://github.com/sib61/fs-router/pulls)
- ⭐ Star the project if you find it useful!

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)
