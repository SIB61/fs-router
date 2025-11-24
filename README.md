# Universal FS Router

[![npm version](https://badge.fury.io/js/%40fs-router%2Fcore.svg)](https://badge.fury.io/js/%40fs-router%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/sib61/fs-router.svg?style=social&label=Star)](https://github.com/sib61/fs-router)

**Universal FS Router** is a lightweight, framework-agnostic file-based routing library that brings Next.js-style routing to your favorite backend frameworks. Build APIs faster with zero configuration and intuitive file-system based routing.

## ✨ Features

- 🚀 **Zero Configuration**: Works out of the box - just create files
- 📂 **File-System Based**: Routes mirror your folder structure
- 🛠️ **TypeScript First**: Full TypeScript support with comprehensive types
- ⚡ **Framework Agnostic**: Works with Express, Fastify, Hono, Koa, and more
- 🔌 **Middleware Support**: Easy middleware integration via `.middleware.ts` files
- 🌐 **Universal**: Runs on Node.js, Bun, Deno, Cloudflare Workers, and Edge
- 📦 **Lightweight**: Minimal overhead, maximum performance
- 🔄 **Hot Reload Friendly**: Perfect for development workflows

## 🚀 Quick Start

### 1. Install for your framework

```bash
# Choose your framework
npm install @fs-router/express    # Express.js
npm install @fs-router/fastify    # Fastify
npm install @fs-router/hono       # Hono
npm install @fs-router/koa        # Koa.js
npm install @fs-router/core       # Build custom adapters
```

### 2. Set up your server

<details>
<summary>📦 Express</summary>

```typescript
import express from 'express';
import { useFsRouter } from '@fs-router/express';

const app = express();
app.use(express.json());

await useFsRouter(app, {
  routesDir: './routes'
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
```
</details>

<details>
<summary>⚡ Fastify</summary>

```typescript
import Fastify from 'fastify';
import { useFsRouter } from '@fs-router/fastify';

const fastify = Fastify({ logger: true });

await useFsRouter(fastify, {
  routesDir: './routes'
});

await fastify.listen({ port: 3000 });
```
</details>

<details>
<summary>🔥 Hono</summary>

```typescript
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono();

await useFsRouter(app, {
  routesDir: './routes'
});

export default app; // Works on any runtime!
```
</details>

<details>
<summary>🕸️ Koa</summary>

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
</details>

### 3. Create your first route

```typescript
// routes/hello.route.ts
export const GET = async (req, res) => {
  return res.json({ message: 'Hello, World! 👋' });
};
```

That's it! Visit `http://localhost:3000/hello` and see your route in action.

## 📁 File-Based Routing

Universal FS Router transforms your file structure into API routes automatically:

| File Path | Route | Description |
|-----------|-------|-------------|
| `route.ts` | `/` | Root route |
| `users.route.ts` | `/users` | Simple route |
| `users/route.ts` | `/users` | Alternative syntax |
| `users/[id].route.ts` | `/users/:id` | Dynamic parameter |
| `posts/[...slug].route.ts` | `/posts/*` | Catch-all route |
| `api/v1/users.route.ts` | `/api/v1/users` | Nested route |
| `auth.middleware.ts` | Applied to `/auth/*` | Route middleware |

### 🎯 Route Handlers

Export functions for different HTTP methods:

```typescript
// routes/users/[id].route.ts
export const GET = async (req, res) => {
  const { id } = req.params;
  const user = await getUserById(id);
  return res.json({ user });
};

export const POST = async (req, res) => {
  const userData = req.body;
  const user = await createUser(userData);
  return res.status(201).json({ user });
};

export const PUT = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const user = await updateUser(id, updates);
  return res.json({ user });
};

export const DELETE = async (req, res) => {
  const { id } = req.params;
  await deleteUser(id);
  return res.status(204).send();
};

// Handle any other method
export default async (req, res) => {
  return res.status(405).json({ 
    error: `Method ${req.method} not allowed` 
  });
};
```

### 🔒 Middleware

Create middleware files to protect routes:

```typescript
// routes/auth.middleware.ts - protects all /auth/* routes
export default async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## 📚 Framework-Specific Examples

<details>
<summary>🌐 <strong>Multi-Runtime with Hono</strong></summary>

Perfect for modern deployment platforms:

```typescript
import { Hono } from 'hono';
import { useFsRouter } from '@fs-router/hono';

const app = new Hono();
await useFsRouter(app, { routesDir: './routes' });

// Node.js / Bun
export default app;

// Cloudflare Workers
export default {
  fetch: app.fetch,
};

// Deno Deploy
Deno.serve(app.fetch);
```
</details>

<details>
<summary>⚡ <strong>High Performance with Fastify</strong></summary>

Built for speed:

```typescript
import Fastify from 'fastify';
import { useFsRouter } from '@fs-router/fastify';

const fastify = Fastify({
  logger: { level: 'info' }
});

// Register plugins
await fastify.register(import('@fastify/cors'));
await fastify.register(import('@fastify/helmet'));

// File-based routes
await useFsRouter(fastify, {
  routesDir: './routes',
  verbose: true
});

await fastify.listen({ 
  port: process.env.PORT || 3000,
  host: '0.0.0.0'
});
```
</details>

<details>
<summary>📦 <strong>Express with Middleware</strong></summary>

The classic choice:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { useFsRouter } from '@fs-router/express';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File-based routing
await useFsRouter(app, {
  routesDir: './routes'
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(3000);
```
</details>

## 🏗️ Project Structure Examples

### REST API
```
routes/
├── api/
│   ├── auth/
│   │   ├── login.route.ts          # POST /api/auth/login
│   │   ├── register.route.ts       # POST /api/auth/register
│   │   └── logout.route.ts         # POST /api/auth/logout
│   ├── users/
│   │   ├── route.ts                # GET,POST /api/users
│   │   ├── [id].route.ts           # GET,PUT,DELETE /api/users/:id
│   │   └── [id]/
│   │       ├── posts.route.ts      # GET,POST /api/users/:id/posts
│   │       └── avatar.route.ts     # PUT /api/users/:id/avatar
│   ├── posts/
│   │   ├── route.ts                # GET,POST /api/posts
│   │   ├── [slug].route.ts         # GET /api/posts/:slug
│   │   └── trending.route.ts       # GET /api/posts/trending
│   └── auth.middleware.ts          # Protects all /api routes
├── webhooks/
│   ├── stripe.route.ts             # POST /webhooks/stripe
│   └── github.route.ts             # POST /webhooks/github
├── upload.route.ts                 # POST /upload
└── health.route.ts                 # GET /health
```

### Microservice
```
routes/
├── users.route.ts                  # User service endpoints
├── auth.route.ts                   # Authentication
├── health.route.ts                 # Health checks  
├── metrics.route.ts                # Monitoring
└── auth.middleware.ts              # Global auth
```

## 🔧 Advanced Usage

### Custom Adapter

Build adapters for any framework:

```typescript
import { createRouter } from '@fs-router/core';
import type { FrameworkAdapter } from '@fs-router/core';

class MyFrameworkAdapter implements FrameworkAdapter {
  constructor(private app: MyFramework) {}

  registerMiddleware(path: string, handler: Function): void {
    this.app.use(path, handler);
  }

  registerRoute(method: string, path: string, handler: Function): void {
    this.app[method.toLowerCase()](path, handler);
  }

  registerDefaultHandler(path: string, handler: Function, methods: string[]): void {
    // Handle default exports
  }

  transformPath(path: string): string {
    return path; // Transform as needed
  }
}

const adapter = new MyFrameworkAdapter(myApp);
await createRouter(adapter, { routesDir: './routes' });
```

### Environment-Specific Routes

```typescript
// routes/admin/[...path].route.ts
export const GET = async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Admin panel only in development
  return res.json({ admin: 'panel' });
};
```

## 🏆 Why Universal FS Router?

### 🚀 **Developer Experience**
- **Intuitive**: If you've used Next.js, you already know how it works
- **Zero Config**: No routing setup, no configuration files
- **TypeScript**: Full type safety out of the box
- **Hot Reload**: Changes reflect immediately during development

### ⚡ **Performance**
- **Minimal Overhead**: Thin layer over your framework's native router
- **Framework Native**: Uses each framework's optimized routing system
- **Zero Runtime**: All routing is resolved at startup

### 🔧 **Flexibility**
- **Framework Agnostic**: Switch frameworks without changing routes
- **Middleware Support**: Easy to add authentication, validation, etc.
- **Universal**: Works everywhere JavaScript runs

### 📦 **Production Ready**
- **Battle Tested**: Used in production applications
- **Well Documented**: Comprehensive guides and examples
- **Active Maintenance**: Regular updates and improvements

## 📦 Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`@fs-router/core`](./packages/core) | Core routing engine and adapter interface | [![npm](https://img.shields.io/npm/v/@fs-router/core.svg)](https://www.npmjs.com/package/@fs-router/core) |
| [`@fs-router/express`](./packages/express) | Express.js adapter | [![npm](https://img.shields.io/npm/v/@fs-router/express.svg)](https://www.npmjs.com/package/@fs-router/express) |
| [`@fs-router/fastify`](./packages/fastify) | Fastify adapter | [![npm](https://img.shields.io/npm/v/@fs-router/fastify.svg)](https://www.npmjs.com/package/@fs-router/fastify) |
| [`@fs-router/hono`](./packages/hono) | Hono adapter (works on any runtime) | [![npm](https://img.shields.io/npm/v/@fs-router/hono.svg)](https://www.npmjs.com/package/@fs-router/hono) |
| [`@fs-router/koa`](./packages/koa) | Koa.js adapter | [![npm](https://img.shields.io/npm/v/@fs-router/koa.svg)](https://www.npmjs.com/package/@fs-router/koa) |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/sib61/fs-router.git
cd fs-router

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development mode
pnpm dev
```

### Testing Examples

```bash
# Test Express implementation
pnpm test:express

# Test Hono implementation  
pnpm test:hono

# Test Fastify implementation
pnpm test:fastify

# Test Koa implementation
pnpm test:koa
```

## 🙋‍♂️ FAQ

<details>
<summary><strong>How does this compare to Next.js API routes?</strong></summary>

Universal FS Router brings the same intuitive file-based routing from Next.js to backend frameworks. The main differences:

- **Framework Choice**: Works with Express, Fastify, Hono, Koa, etc.
- **Runtime Agnostic**: Runs on Node.js, Bun, Deno, Cloudflare Workers
- **Backend Focus**: Optimized for API development, not SSR
- **Zero Lock-in**: Use your preferred tools and deployment platforms
</details>

<details>
<summary><strong>Can I migrate existing routes gradually?</strong></summary>

Yes! Universal FS Router works alongside existing routes. You can:

1. Set up fs-router for new routes
2. Gradually migrate existing routes to files
3. Keep existing middleware and error handling
4. Mix file-based and traditional routes in the same app
</details>

<details>
<summary><strong>Does this work with serverless functions?</strong></summary>

Absolutely! It works great with:

- **Vercel Functions** (with Express/Hono)
- **Netlify Functions** (with Express/Hono) 
- **AWS Lambda** (with any framework)
- **Cloudflare Workers** (with Hono)
- **Deno Deploy** (with Hono)
- And any other serverless platform that supports your framework
</details>

<details>
<summary><strong>How do I handle authentication?</strong></summary>

Use middleware files for authentication:

```typescript
// routes/api/auth.middleware.ts
export default async (req, res, next) => {
  // Your auth logic here
  const user = await authenticateUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
};
```

This protects all routes under `/api/`.
</details>

## 📄 License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)

---

<div align="center">
  <strong>Ready to build APIs faster?</strong><br>
  <a href="https://github.com/sib61/fs-router/tree/main/packages">Choose your framework</a> and get started in minutes! 🚀
</div>