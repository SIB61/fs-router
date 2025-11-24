# @fs-router/koa

File-based routing adapter for **Koa.js**. Brings Next.js-style file-based routing to your Koa applications with zero configuration and full TypeScript support.

[![npm version](https://badge.fury.io/js/%40fs-router%2Fkoa.svg)](https://badge.fury.io/js/%40fs-router%2Fkoa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Zero Configuration**: Works out of the box with Koa
- 📂 **File-System Based**: Define routes by creating files
- 🛠️ **TypeScript Support**: Full TypeScript support with Koa types
- ⚡ **Lightweight**: Minimal overhead over native Koa routing
- 🔌 **Middleware Support**: Easy middleware integration via `.middleware.ts` files
- 🎯 **Koa Native**: Uses @koa/router under the hood
- 🔄 **Async/Await**: Full support for async route handlers

## Installation

```bash
# npm
npm install @fs-router/koa @koa/router

# yarn
yarn add @fs-router/koa @koa/router

# pnpm
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

// Global middleware
app.use(bodyParser());

// Set up file-based routing
await useFsRouter(router, {
  routesDir: './routes',
  verbose: true // Optional: enable logging
});

// Apply router
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## File-Based Routing

### Route Files

Create route files in your `routes` directory:

| File Path | Koa Route | Description |
|-----------|-----------|-------------|
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
import type { Context } from 'koa';

interface UserParams {
  id: string;
}

interface UserBody {
  name: string;
  email: string;
}

export const GET = async (ctx: Context) => {
  const { id } = ctx.params;
  
  const user = await getUserById(id);
  
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
    return;
  }
  
  ctx.body = {
    id,
    user,
    message: `Getting user ${id}`
  };
};

export const POST = async (ctx: Context) => {
  const { id } = ctx.params;
  const userData = ctx.request.body as UserBody;
  
  const createdUser = await createUser(id, userData);
  
  ctx.status = 201;
  ctx.body = {
    id,
    created: true,
    user: createdUser
  };
};

export const PUT = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body as Partial<UserBody>;
  
  const updatedUser = await updateUser(id, updates);
  
  ctx.body = {
    id,
    updated: true,
    user: updatedUser
  };
};

export const DELETE = async (ctx: Context) => {
  const { id } = ctx.params;
  
  await deleteUser(id);
  
  ctx.status = 204;
};

// Handle any other HTTP method not explicitly defined
export default async (ctx: Context) => {
  ctx.status = 405;
  ctx.body = {
    error: `Method ${ctx.method} not allowed`
  };
};
```

### Middleware

Create middleware files using the `.middleware.ts` suffix:

```typescript
// routes/auth.middleware.ts
import type { Context, Next } from 'koa';

export default async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: 'No authorization token' };
    return;
  }
  
  try {
    const decoded = await verifyJWT(token);
    ctx.state.user = decoded;
    
    console.log('Auth middleware passed');
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid token' };
  }
};
```

```typescript
// routes/api/rate-limit.middleware.ts
import type { Context, Next } from 'koa';

const requests = new Map();

export default async (ctx: Context, next: Next) => {
  const ip = ctx.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;
  
  if (!requests.has(ip)) {
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    return await next();
  }
  
  const clientRequests = requests.get(ip);
  
  if (now > clientRequests.resetTime) {
    clientRequests.count = 1;
    clientRequests.resetTime = now + windowMs;
    return await next();
  }
  
  if (clientRequests.count >= maxRequests) {
    ctx.status = 429;
    ctx.body = { error: 'Too many requests' };
    return;
  }
  
  clientRequests.count++;
  await next();
};
```

## Advanced Usage

### With TypeScript Context

```typescript
// types/koa.d.ts
declare module 'koa' {
  interface DefaultState {
    user?: {
      id: string;
      email: string;
    };
  }
  
  interface DefaultContext {
    // Custom context properties
  }
}

// routes/protected/profile.route.ts
import type { Context } from 'koa';

export const GET = async (ctx: Context) => {
  // User is set by middleware in ctx.state
  const user = ctx.state.user;
  
  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized' };
    return;
  }
  
  const profile = await getUserProfile(user.id);
  
  ctx.body = { profile };
};

export const PATCH = async (ctx: Context) => {
  const user = ctx.state.user;
  const updates = ctx.request.body;
  
  const updatedProfile = await updateUserProfile(user.id, updates);
  
  ctx.body = {
    message: 'Profile updated',
    profile: updatedProfile
  };
};
```

### Error Handling

```typescript
// routes/users/[id].route.ts
import type { Context } from 'koa';

export const GET = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    
    if (!isValidId(id)) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid user ID format' };
      return;
    }
    
    const user = await getUserById(id);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    
    ctx.body = { user };
  } catch (error) {
    console.error('Unexpected error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
};
```

### Request Validation

```typescript
// routes/users.route.ts
import type { Context } from 'koa';
import Joi from 'joi';

const userSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(0).max(150).required()
});

export const POST = async (ctx: Context) => {
  try {
    const { error, value } = userSchema.validate(ctx.request.body);
    
    if (error) {
      ctx.status = 400;
      ctx.body = {
        error: 'Validation failed',
        details: error.details
      };
      return;
    }
    
    const user = await createUser(value);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      user
    };
  } catch (error) {
    console.error('Create user error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to create user' };
  }
};
```

### File Upload Route

```typescript
// routes/upload.route.ts
import type { Context } from 'koa';
import multer from '@koa/multer';
import path from 'path';

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const POST = [
  upload.single('file'),
  async (ctx: Context) => {
    try {
      const file = (ctx.request as any).file;
      
      if (!file) {
        ctx.status = 400;
        ctx.body = { error: 'No file uploaded' };
        return;
      }
      
      // Process file
      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join('uploads', filename);
      
      // Move or process file as needed
      await processUploadedFile(file.path, filepath);
      
      ctx.body = {
        message: 'File uploaded successfully',
        filename: file.originalname,
        size: file.size
      };
    } catch (error) {
      console.error('Upload error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Upload failed' };
    }
  }
];
```

## Integration with Koa Features

### With Koa Middleware

```typescript
import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import logger from 'koa-logger';
import { useFsRouter } from '@fs-router/koa';

const app = new Koa();
const router = new Router();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(logger());
app.use(bodyParser());

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: ctx.status === 500 ? 'Internal Server Error' : err.message
    };
    
    if (ctx.status === 500) {
      console.error('Server Error:', err);
    }
  }
});

// File-based routes
await useFsRouter(router, {
  routesDir: './routes'
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
```

### With Koa Compose

```typescript
import compose from 'koa-compose';
import type { Context } from 'koa';

// routes/api/complex.route.ts
const authMiddleware = async (ctx: Context, next: () => Promise<any>) => {
  // Auth logic
  await next();
};

const validateMiddleware = async (ctx: Context, next: () => Promise<any>) => {
  // Validation logic
  await next();
};

const handler = async (ctx: Context) => {
  ctx.body = { message: 'Complex route with composed middleware' };
};

export const POST = compose([authMiddleware, validateMiddleware, handler]);
```

### With Custom Router Instance

```typescript
import Koa from 'koa';
import Router from '@koa/router';
import { KoaAdapter } from '@fs-router/koa';
import { createRouter } from '@fs-router/core';

const app = new Koa();

// Create separate routers for different route groups
const apiRouter = new Router({ prefix: '/api' });
const webhooksRouter = new Router({ prefix: '/webhooks' });

// Set up file-based routing on different routers
const apiAdapter = new KoaAdapter(apiRouter);
await createRouter(apiAdapter, {
  routesDir: './api-routes'
});

const webhooksAdapter = new KoaAdapter(webhooksRouter);
await createRouter(webhooksAdapter, {
  routesDir: './webhook-routes'
});

// Apply routers
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());
app.use(webhooksRouter.routes());
app.use(webhooksRouter.allowedMethods());

app.listen(3000);
```

## API Reference

### `useFsRouter(router, options)`

Sets up file-based routing on a Koa Router instance.

**Parameters:**
- `router` - @koa/router instance (required)
- `options.routesDir` - Directory containing route files (required)
- `options.verbose` - Enable verbose logging (optional, default: false)

**Returns:** `Promise<void>`

### `KoaAdapter`

The underlying adapter class. Use this for advanced customization:

```typescript
import { KoaAdapter } from '@fs-router/koa';
import { createRouter } from '@fs-router/core';

const adapter = new KoaAdapter(router);
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

### GraphQL Integration

```typescript
// routes/graphql.route.ts
import type { Context } from 'koa';
import { graphqlHTTP } from 'koa-graphql';
import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Query {
    hello: String
    user(id: ID!): User
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
  }
`);

const rootValue = {
  hello: () => 'Hello world!',
  user: ({ id }) => getUserById(id),
};

export const POST = graphqlHTTP({
  schema,
  rootValue,
  graphiql: process.env.NODE_ENV === 'development',
});

export const GET = graphqlHTTP({
  schema,
  rootValue,
  graphiql: process.env.NODE_ENV === 'development',
});
```

### Server-Sent Events

```typescript
// routes/events/stream.route.ts
import type { Context } from 'koa';

export const GET = async (ctx: Context) => {
  ctx.request.socket.setTimeout(0);
  ctx.req.socket.setNoDelay(true);
  ctx.req.socket.setKeepAlive(true);

  ctx.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const sendEvent = (data: any) => {
    ctx.res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial message
  sendEvent({ message: 'Connected to stream' });

  // Set up periodic updates
  const interval = setInterval(() => {
    sendEvent({ 
      timestamp: new Date().toISOString(),
      data: 'Server time update'
    });
  }, 5000);

  // Clean up on connection close
  ctx.req.on('close', () => {
    clearInterval(interval);
  });

  // Keep connection open
  await new Promise(() => {});
};
```

## Migration from Koa Router

### Before (Koa Router)

```typescript
const router = new Router();

router.get('/users', async (ctx) => {
  ctx.body = { users: await getUsers() };
});

router.get('/users/:id', async (ctx) => {
  const { id } = ctx.params;
  ctx.body = { user: await getUserById(id) };
});

router.post('/users', async (ctx) => {
  const user = await createUser(ctx.request.body);
  ctx.status = 201;
  ctx.body = { user };
});

app.use(router.routes());
```

### After (FS Router)

```typescript
// routes/users.route.ts
export const GET = async (ctx) => {
  ctx.body = { users: await getUsers() };
};

export const POST = async (ctx) => {
  const user = await createUser(ctx.request.body);
  ctx.status = 201;
  ctx.body = { user };
};

// routes/users/[id].route.ts
export const GET = async (ctx) => {
  const { id } = ctx.params;
  ctx.body = { user: await getUserById(id) };
};

// main.ts
await useFsRouter(router, { routesDir: './routes' });
app.use(router.routes());
```

## Best Practices

### Context State Management

```typescript
// Use ctx.state for request-scoped data
export const GET = async (ctx: Context) => {
  ctx.state.startTime = Date.now();
  
  const data = await fetchData();
  
  ctx.body = {
    data,
    processingTime: Date.now() - ctx.state.startTime
  };
};
```

### Error Boundaries

```typescript
// routes/api.middleware.ts
export default async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.name === 'ValidationError') {
      ctx.status = 400;
      ctx.body = { error: error.message };
    } else if (error.name === 'UnauthorizedError') {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized' };
    } else {
      ctx.status = 500;
      ctx.body = { error: 'Internal Server Error' };
    }
  }
};
```

## Contributing

This package is part of the Universal FS Router monorepo. Please see the [main repository](https://github.com/sib61/fs-router) for contribution guidelines.

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)