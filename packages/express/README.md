# @fs-router/express

File-based routing for **Express.js** - brings Next.js-style routing conventions to Express with zero configuration.

[![npm version](https://badge.fury.io/js/%40fs-router%2Fexpress.svg)](https://badge.fury.io/js/%40fs-router%2Fexpress)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 Zero Configuration
- 📂 File-System Based Routes
- 🛠️ Full TypeScript Support
- ⚡ Lightweight & Fast
- 🔌 Automatic Middleware Detection
- 🎯 Express Native Routing

## Installation

```bash
npm install @fs-router/express
# or
yarn add @fs-router/express
# or
pnpm add @fs-router/express
```

## Quick Start

```typescript
import express from 'express';
import { useFsRouter } from '@fs-router/express';

const app = express();
app.use(express.json());

await useFsRouter(app, {
  routesDir: 'routes', // Use 'src/routes' if using src folder
  verbose: true
});

app.listen(3000);
```

## Route Conventions

### File Structure to Routes

| File Path | Express Route | Description |
|-----------|---------------|-------------|
| `route.ts` | `/` | Root route |
| `users.route.ts` | `/users` | Simple route |
| `users/[id].route.ts` | `/users/:id` | Dynamic parameter |
| `posts/[...slug].route.ts` | `/posts/*slug` | Catch-all route |
| `api/v1/users.route.ts` | `/api/v1/users` | Nested route |

### HTTP Method Handlers

Export functions named after HTTP methods:

```typescript
// routes/users/[id].route.ts
import type { Request, Response } from 'express';

export const GET = (req: Request, res: Response) => {
  res.json({ id: req.params.id });
};

export const POST = (req: Request, res: Response) => {
  res.status(201).json({ created: true });
};

export const PUT = (req: Request, res: Response) => {
  res.json({ updated: true });
};

export const DELETE = (req: Request, res: Response) => {
  res.status(204).send();
};

// Fallback for other methods
export default (req: Request, res: Response) => {
  res.status(405).json({ error: `Method ${req.method} not allowed` });
};
```

### Middleware Files

Create middleware with `.middleware.ts` suffix:

```typescript
// routes/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Validate token
  next();
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

### Async Handlers

```typescript
// routes/posts.route.ts
export const GET = async (req, res) => {
  const posts = await db.posts.findMany();
  res.json({ posts });
};

export const POST = async (req, res) => {
  const post = await db.posts.create({ data: req.body });
  res.status(201).json({ post });
};
```

### Error Handling

```typescript
// routes/users/[id].route.ts
export const GET = async (req, res, next) => {
  try {
    const user = await db.users.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
```

### Catch-All Routes

```typescript
// routes/docs/[...path].route.ts
export const GET = (req, res) => {
  const path = req.params.path || '';
  res.json({ 
    documentation: `Docs for ${path}` 
  });
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

### `ExpressAdapter`

For advanced usage with custom router instances:

```typescript
import { ExpressAdapter } from '@fs-router/express';
import { createRouter } from '@fs-router/core';

const router = express.Router();
const adapter = new ExpressAdapter(router);

await createRouter(adapter, {
  routesDir: 'routes',
  verbose: true
});

app.use('/api', router);
```

## Migration Guide

### Before (Express Router)

```typescript
app.get('/users', (req, res) => res.json({ users: [] }));
app.get('/users/:id', (req, res) => res.json({ id: req.params.id }));
```

### After (FS Router)

```typescript
// routes/users.route.ts
export const GET = (req, res) => res.json({ users: [] });

// routes/users/[id].route.ts
export const GET = (req, res) => res.json({ id: req.params.id });
```

## Contributing

We welcome contributions! Please visit our [GitHub repository](https://github.com/sib61/fs-router) to:

- 🐛 [Report bugs](https://github.com/sib61/fs-router/issues)
- 💡 [Request features](https://github.com/sib61/fs-router/issues)
- 🔧 [Submit pull requests](https://github.com/sib61/fs-router/pulls)
- ⭐ Star the project if you find it useful!

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)
