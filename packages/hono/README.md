# @fs-router/hono

File-based routing adapter for **Hono**. Brings Next.js-style file-based routing to your Hono applications with zero configuration and full TypeScript support. Perfect for building APIs that run on any JavaScript runtime.

[![npm version](https://badge.fury.io/js/%40fs-router%2Fhono.svg)](https://badge.fury.io/js/%40fs-router%2Fhono)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Zero Configuration**: Works out of the box with Hono
- 📂 **File-System Based**: Define routes by creating files
- 🛠️ **TypeScript Support**: Full TypeScript support with Hono types
- ⚡ **Ultra Fast**: Built on Hono's ultra-fast web framework
- 🌐 **Universal**: Works on Node.js, Bun, Deno, Cloudflare Workers, and more
- 🔌 **Middleware Support**: Easy middleware integration via `.middleware.ts` files
- 🎯 **Hono Native**: Uses Hono's native routing under the hood

## Installation

```bash
# npm
npm install @fs-router/hono

# yarn
yarn add @fs-router/hono

# pnpm
pnpm add @fs-router/hono
```

## Quick Start

```typescript
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono();

// Set up file-based routing
await useFsRouter(app, {
  routesDir: './routes',
  verbose: true // Optional: enable logging
});

// For Node.js
export default app;

// For Bun
export default {
  port: 3000,
  fetch: app.fetch,
};

// For Deno
Deno.serve(app.fetch);

// For Cloudflare Workers
export default app;
```

## File-Based Routing

### Route Files

Create route files in your `routes` directory:

| File Path | Hono Route | Description |
|-----------|------------|-------------|
| `route.ts` | `/` | Root route |
| `users.route.ts` | `/users` | Simple route |
| `users/route.ts` | `/users` | Alternative syntax |
| `users/[id].route.ts` | `/users/:id` | Dynamic parameter |
| `posts/[...slug].route.ts` | `/posts/*` | Catch-all route |
| `api/v1/users.route.ts` | `/api/v1/users` | Nested route |

### HTTP Methods

Export functions named after HTTP methods:

```typescript
// routes/users/[id].route.ts
import type { Context } from 'hono';

interface UserParams {
  id: string;
}

export const GET = async (c: Context<{ Variables: { user?: any } }>) => {
  const id = c.req.param('id');
  
  const user = await getUserById(id);
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json({
    id,
    user,
    message: `Getting user ${id}`
  });
};

export const POST = async (c: Context) => {
  const id = c.req.param('id');
  const userData = await c.req.json();
  
  const createdUser = await createUser(id, userData);
  
  return c.json({
    id,
    created: true,
    user: createdUser
  }, 201);
};

export const PUT = async (c: Context) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  
  const updatedUser = await updateUser(id, updates);
  
  return c.json({
    id,
    updated: true,
    user: updatedUser
  });
};

export const DELETE = async (c: Context) => {
  const id = c.req.param('id');
  
  await deleteUser(id);
  
  return c.json({ deleted: true }, 204);
};

// Handle any other HTTP method not explicitly defined
export default async (c: Context) => {
  return c.json({
    error: `Method ${c.req.method} not allowed`
  }, 405);
};
```

### Middleware

Create middleware files using the `.middleware.ts` suffix:

```typescript
// routes/auth.middleware.ts
import type { Context, Next } from 'hono';
import { jwt } from 'hono/jwt';

export default async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'No authorization token' }, 401);
  }
  
  try {
    const decoded = await verifyJWT(token);
    c.set('user', decoded);
    
    console.log('Auth middleware passed');
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};
```

```typescript
// routes/api/cors.middleware.ts
import type { Context, Next } from 'hono';
import { cors } from 'hono/cors';

export default cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
});
```

## Advanced Usage

### With Hono Context Variables

```typescript
// routes/protected/profile.route.ts
import type { Context } from 'hono';

type Variables = {
  user: {
    id: string;
    email: string;
  };
};

export const GET = async (c: Context<{ Variables: Variables }>) => {
  // User is set by middleware
  const user = c.get('user');
  
  const profile = await getUserProfile(user.id);
  
  return c.json({ profile });
};

export const PATCH = async (c: Context<{ Variables: Variables }>) => {
  const user = c.get('user');
  const updates = await c.req.json();
  
  const updatedProfile = await updateUserProfile(user.id, updates);
  
  return c.json({
    message: 'Profile updated',
    profile: updatedProfile
  });
};
```

### Error Handling

```typescript
// routes/users/[id].route.ts
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const GET = async (c: Context) => {
  try {
    const id = c.req.param('id');
    
    if (!isValidId(id)) {
      throw new HTTPException(400, {
        message: 'Invalid user ID format'
      });
    }
    
    const user = await getUserById(id);
    
    if (!user) {
      throw new HTTPException(404, {
        message: 'User not found'
      });
    }
    
    return c.json({ user });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Unexpected error:', error);
    throw new HTTPException(500, {
      message: 'Internal server error'
    });
  }
};
```

### Validation with Zod

```typescript
// routes/users.route.ts
import type { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).max(150)
});

export const POST = async (c: Context) => {
  // Manual validation (or use zValidator middleware in main app)
  const body = await c.req.json();
  
  try {
    const validatedData = userSchema.parse(body);
    const user = await createUser(validatedData);
    
    return c.json({
      success: true,
      user
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        details: error.errors
      }, 400);
    }
    
    throw error;
  }
};
```

### WebSocket Routes (Hono v4+)

```typescript
// routes/ws/chat.route.ts
import type { Context } from 'hono';
import { upgradeWebSocket } from 'hono/cloudflare-workers'; // or appropriate adapter

export const GET = upgradeWebSocket((c) => {
  return {
    onMessage(event, ws) {
      console.log(`Message from client: ${event.data}`);
      ws.send(`Echo: ${event.data}`);
    },
    onClose: () => {
      console.log('Connection closed');
    },
    onOpen: () => {
      console.log('Connection opened');
    },
  };
});
```

## Integration with Hono Features

### With Hono Middleware

```typescript
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', timing());
app.use('*', secureHeaders());
app.use('*', prettyJSON());

// File-based routes
await useFsRouter(app, {
  routesDir: './routes'
});

export default app;
```

### With Hono JSX (for SSR)

```typescript
// routes/pages/users/[id].route.ts
import type { Context } from 'hono';
import { Layout } from '../../../components/Layout';
import { UserProfile } from '../../../components/UserProfile';

export const GET = async (c: Context) => {
  const id = c.req.param('id');
  const user = await getUserById(id);
  
  if (!user) {
    return c.notFound();
  }
  
  return c.html(
    <Layout title={`User: ${user.name}`}>
      <UserProfile user={user} />
    </Layout>
  );
};
```

### Environment-Specific Builds

```typescript
// For Cloudflare Workers
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono<{ Bindings: CloudflareBindings }>();

await useFsRouter(app, {
  routesDir: './routes'
});

export default app;

// For Bun
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono();

await useFsRouter(app, {
  routesDir: './routes'
});

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
```

## API Reference

### `useFsRouter(app, options)`

Sets up file-based routing on a Hono application.

**Parameters:**
- `app` - Hono application instance
- `options.routesDir` - Directory containing route files (required)
- `options.verbose` - Enable verbose logging (optional, default: false)

**Returns:** `Promise<void>`

### `HonoAdapter`

The underlying adapter class. Use this for advanced customization:

```typescript
import { HonoAdapter } from '@fs-router/hono';
import { createRouter } from '@fs-router/core';

const adapter = new HonoAdapter(app);
await createRouter(adapter, {
  routesDir: './routes',
  verbose: true
});
```

## Examples

### REST API Structure

```
routes/
├── api/
│   ├── auth/
│   │   ├── login.route.ts      # POST /api/auth/login
│   │   ├── register.route.ts   # POST /api/auth/register
│   │   └── refresh.route.ts    # POST /api/auth/refresh
│   ├── users/
│   │   ├── route.ts            # GET,POST /api/users
│   │   ├── [id].route.ts       # GET,PUT,DELETE /api/users/:id
│   │   └── [id]/
│   │       └── posts.route.ts  # GET,POST /api/users/:id/posts
│   └── auth.middleware.ts      # Middleware for all /api routes
├── webhooks/
│   └── stripe.route.ts         # POST /webhooks/stripe
└── health.route.ts             # GET /health
```

### File Upload Route

```typescript
// routes/upload.route.ts
import type { Context } from 'hono';

export const POST = async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File;
    
    if (!file) {
      return c.json({ error: 'No file uploaded' }, 400);
    }
    
    // Process file
    const buffer = await file.arrayBuffer();
    const filename = `${Date.now()}-${file.name}`;
    
    // Save file logic here (depends on your environment)
    await saveFile(filename, buffer);
    
    return c.json({
      message: 'File uploaded successfully',
      filename: file.name,
      size: buffer.byteLength
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
};
```

### GraphQL Integration

```typescript
// routes/graphql.route.ts
import type { Context } from 'hono';
import { graphqlServer } from '@hono/graphql-server';
import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const rootValue = {
  hello: () => 'Hello world!',
};

export const POST = graphqlServer({
  schema,
  rootValue,
  graphiql: true, // Enable GraphiQL in development
});

export const GET = graphqlServer({
  schema,
  rootValue,
  graphiql: true,
});
```

## Runtime-Specific Examples

### Cloudflare Workers

```typescript
// worker.ts
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

await useFsRouter(app, {
  routesDir: './routes'
});

export default app;

// routes/api/data.route.ts
export const GET = async (c: Context<{ Bindings: Bindings }>) => {
  const db = c.env.DB;
  const result = await db.prepare("SELECT * FROM users").all();
  return c.json(result);
};
```

### Deno Deploy

```typescript
// main.ts
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { useFsRouter } from 'npm:@fs-router/hono';

const app = new Hono();

await useFsRouter(app, {
  routesDir: './routes'
});

Deno.serve(app.fetch);
```

## Migration from Hono Routes

### Before (Hono Routes)

```typescript
const app = new Hono();

app.get('/users', (c) => {
  return c.json({ users: [] });
});

app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ user: { id } });
});

app.post('/users', async (c) => {
  const body = await c.req.json();
  return c.json({ created: true, user: body });
});
```

### After (FS Router)

```typescript
// routes/users.route.ts
export const GET = (c) => {
  return c.json({ users: [] });
};

export const POST = async (c) => {
  const body = await c.req.json();
  return c.json({ created: true, user: body });
};

// routes/users/[id].route.ts
export const GET = (c) => {
  const id = c.req.param('id');
  return c.json({ user: { id } });
};

// main.ts
await useFsRouter(app, { routesDir: './routes' });
```

## Performance

Hono is designed for maximum performance, and `@fs-router/hono` maintains this by:

- Using Hono's native routing system
- Zero runtime overhead for route registration
- Compatible with all Hono optimizations
- Works across all JavaScript runtimes

## Contributing

This package is part of the Universal FS Router monorepo. Please see the [main repository](https://github.com/sib61/fs-router) for contribution guidelines.

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)