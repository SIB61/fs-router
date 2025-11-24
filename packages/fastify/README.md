# @fs-router/fastify

File-based routing adapter for **Fastify**. Brings Next.js-style file-based routing to your Fastify applications with zero configuration and full TypeScript support.

[![npm version](https://badge.fury.io/js/%40fs-router%2Ffastify.svg)](https://badge.fury.io/js/%40fs-router%2Ffastify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Zero Configuration**: Works out of the box with Fastify
- 📂 **File-System Based**: Define routes by creating files
- 🛠️ **TypeScript Support**: Full TypeScript support with Fastify types
- ⚡ **High Performance**: Built on Fastify's high-performance architecture
- 🔌 **Middleware Support**: Easy middleware integration via `.middleware.ts` files
- 🎯 **Fastify Native**: Uses Fastify's native routing under the hood
- 🔄 **Async/Await**: Full support for async route handlers

## Installation

```bash
# npm
npm install @fs-router/fastify

# yarn
yarn add @fs-router/fastify

# pnpm
pnpm add @fs-router/fastify
```

## Quick Start

```typescript
import Fastify from 'fastify';
import { useFsRouter } from '@fs-router/fastify';

const fastify = Fastify({
  logger: true
});

// Set up file-based routing
await useFsRouter(fastify, {
  routesDir: './routes',
  verbose: true // Optional: enable logging
});

// Start the server
try {
  await fastify.listen({ port: 3000, host: '0.0.0.0' });
  console.log('Server running on http://localhost:3000');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
```

## File-Based Routing

### Route Files

Create route files in your `routes` directory:

| File Path | Fastify Route | Description |
|-----------|---------------|-------------|
| `route.ts` | `/` | Root route |
| `users.route.ts` | `/users` | Simple route |
| `users/route.ts` | `/users` | Alternative syntax |
| `users/[id].route.ts` | `/users/:id` | Dynamic parameter |
| `posts/[...slug].route.ts` | `/posts/*` | Catch-all route |
| `api/v1/users.route.ts` | `/api/v1/users` | Nested route |

### HTTP Methods

Export async functions named after HTTP methods:

```typescript
// routes/users/[id].route.ts
import type { FastifyRequest, FastifyReply } from 'fastify';

interface UserParams {
  id: string;
}

interface UserBody {
  name: string;
  email: string;
}

export const GET = async (
  request: FastifyRequest<{ Params: UserParams }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  
  // Simulate database lookup
  const user = await getUserById(id);
  
  if (!user) {
    return reply.code(404).send({
      error: 'User not found'
    });
  }
  
  return {
    id,
    user,
    message: `Getting user ${id}`
  };
};

export const POST = async (
  request: FastifyRequest<{ Params: UserParams; Body: UserBody }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const userData = request.body;
  
  const createdUser = await createUser(id, userData);
  
  return reply.code(201).send({
    id,
    created: true,
    user: createdUser
  });
};

export const PUT = async (
  request: FastifyRequest<{ Params: UserParams; Body: Partial<UserBody> }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const updates = request.body;
  
  const updatedUser = await updateUser(id, updates);
  
  return {
    id,
    updated: true,
    user: updatedUser
  };
};

export const DELETE = async (
  request: FastifyRequest<{ Params: UserParams }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  
  await deleteUser(id);
  
  return reply.code(204).send();
};

// Handle any other HTTP method not explicitly defined
export default async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.code(405).send({
    error: `Method ${request.method} not allowed`
  });
};
```

### Middleware

Create middleware files using the `.middleware.ts` suffix:

```typescript
// routes/auth.middleware.ts
import type { FastifyRequest, FastifyReply } from 'fastify';

export default async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.headers.authorization;
  
  if (!token) {
    return reply.code(401).send({
      error: 'No authorization token'
    });
  }
  
  try {
    // Validate token logic here
    const decoded = await verifyToken(token.replace('Bearer ', ''));
    request.user = decoded;
    
    console.log('Auth middleware passed');
  } catch (error) {
    return reply.code(401).send({
      error: 'Invalid token'
    });
  }
};
```

```typescript
// routes/api/rate-limit.middleware.ts
import type { FastifyRequest, FastifyReply } from 'fastify';

const requests = new Map();

export default async (request: FastifyRequest, reply: FastifyReply) => {
  const ip = request.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;
  
  if (!requests.has(ip)) {
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    return;
  }
  
  const clientRequests = requests.get(ip);
  
  if (now > clientRequests.resetTime) {
    clientRequests.count = 1;
    clientRequests.resetTime = now + windowMs;
    return;
  }
  
  if (clientRequests.count >= maxRequests) {
    return reply.code(429).send({
      error: 'Too many requests'
    });
  }
  
  clientRequests.count++;
};
```

## Advanced Usage

### With JSON Schema Validation

```typescript
// routes/users.route.ts
import type { FastifyRequest, FastifyReply } from 'fastify';

interface CreateUserBody {
  name: string;
  email: string;
  age: number;
}

export const POST = async (
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply
) => {
  // Add schema validation in your Fastify setup
  const { name, email, age } = request.body;
  
  const user = await createUser({ name, email, age });
  
  return reply.code(201).send({
    success: true,
    user
  });
};

// In your main server file, add schema:
const userSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'age'],
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      age: { type: 'integer', minimum: 0 }
    }
  }
};

// This would be handled automatically by fs-router
// fastify.post('/users', { schema: userSchema }, handler);
```

### Error Handling

```typescript
// routes/users/[id].route.ts
import type { FastifyRequest, FastifyReply } from 'fastify';

export const GET = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    
    const user = await getUserById(id);
    
    if (!user) {
      return reply.code(404).send({
        error: 'User not found',
        statusCode: 404
      });
    }
    
    return { user };
  } catch (error) {
    request.log.error(error);
    
    return reply.code(500).send({
      error: 'Internal server error',
      statusCode: 500
    });
  }
};
```

### Using Fastify Hooks

```typescript
// routes/protected/profile.route.ts
import type { FastifyRequest, FastifyReply } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
  };
}

export const GET = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
) => {
  // User is already authenticated via middleware
  const user = request.user;
  
  const profile = await getUserProfile(user.id);
  
  return {
    profile
  };
};

export const PATCH = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
) => {
  const updates = request.body;
  const userId = request.user.id;
  
  const updatedProfile = await updateUserProfile(userId, updates);
  
  return {
    message: 'Profile updated',
    profile: updatedProfile
  };
};
```

## Integration with Fastify Features

### With Fastify Plugins

```typescript
import Fastify from 'fastify';
import { useFsRouter } from '@fs-router/fastify';

const fastify = Fastify({ logger: true });

// Register plugins
await fastify.register(import('@fastify/cors'), {
  origin: true
});

await fastify.register(import('@fastify/helmet'));

await fastify.register(import('@fastify/jwt'), {
  secret: 'your-secret-key'
});

// File-based routes
await useFsRouter(fastify, {
  routesDir: './routes'
});

await fastify.listen({ port: 3000 });
```

### With Custom Context

```typescript
// types/fastify.d.ts
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
    };
  }
}

// routes/auth/login.route.ts
export const POST = async (
  request: FastifyRequest<{ Body: { email: string; password: string } }>,
  reply: FastifyReply
) => {
  const { email, password } = request.body;
  
  const user = await authenticateUser(email, password);
  
  if (!user) {
    return reply.code(401).send({
      error: 'Invalid credentials'
    });
  }
  
  const token = fastify.jwt.sign({ 
    id: user.id, 
    email: user.email 
  });
  
  return {
    token,
    user
  };
};
```

### With Fastify Multipart

```typescript
// routes/upload.route.ts
import type { FastifyRequest, FastifyReply } from 'fastify';

export const POST = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Register multipart in your main server:
    // await fastify.register(import('@fastify/multipart'));
    
    const data = await request.file();
    
    if (!data) {
      return reply.code(400).send({
        error: 'No file uploaded'
      });
    }
    
    // Process file
    const buffer = await data.toBuffer();
    const filename = `${Date.now()}-${data.filename}`;
    
    // Save file logic here
    await saveFile(filename, buffer);
    
    return {
      message: 'File uploaded successfully',
      filename: data.filename,
      size: buffer.length
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Upload failed'
    });
  }
};
```

## API Reference

### `useFsRouter(fastify, options)`

Sets up file-based routing on a Fastify instance.

**Parameters:**
- `fastify` - Fastify instance
- `options.routesDir` - Directory containing route files (required)
- `options.verbose` - Enable verbose logging (optional, default: false)

**Returns:** `Promise<void>`

### `FastifyAdapter`

The underlying adapter class. Use this for advanced customization:

```typescript
import { FastifyAdapter } from '@fs-router/fastify';
import { createRouter } from '@fs-router/core';

const adapter = new FastifyAdapter(fastify);
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

### WebSocket Route (with Fastify WebSocket)

```typescript
// routes/ws/chat.route.ts
import type { FastifyRequest } from 'fastify';
import type { WebSocket } from 'ws';

// Note: You need to register @fastify/websocket plugin
export const GET = async (request: FastifyRequest, socket: WebSocket) => {
  socket.on('message', (message) => {
    // Broadcast to all connected clients
    socket.send(`Echo: ${message}`);
  });
  
  socket.on('close', () => {
    console.log('Client disconnected');
  });
  
  socket.send('Welcome to chat!');
};
```

## Migration from Fastify Routes

### Before (Fastify Routes)

```typescript
fastify.get('/users', async (request, reply) => {
  return { users: await getUsers() };
});

fastify.get('/users/:id', async (request, reply) => {
  const { id } = request.params;
  return { user: await getUserById(id) };
});

fastify.post('/users', async (request, reply) => {
  const user = await createUser(request.body);
  return reply.code(201).send({ user });
});
```

### After (FS Router)

```typescript
// routes/users.route.ts
export const GET = async () => {
  return { users: await getUsers() };
};

export const POST = async (request, reply) => {
  const user = await createUser(request.body);
  return reply.code(201).send({ user });
};

// routes/users/[id].route.ts
export const GET = async (request) => {
  const { id } = request.params;
  return { user: await getUserById(id) };
};

// main.ts
await useFsRouter(fastify, { routesDir: './routes' });
```

## Performance Considerations

Fastify is designed for high performance, and `@fs-router/fastify` maintains this by:

- Using Fastify's native routing system
- Supporting async/await throughout
- Minimal overhead in route registration
- Compatible with Fastify's built-in validation and serialization

## Contributing

This package is part of the Universal FS Router monorepo. Please see the [main repository](https://github.com/sib61/fs-router) for contribution guidelines.

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)