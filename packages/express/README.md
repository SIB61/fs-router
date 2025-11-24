# @fs-router/express

File-based routing adapter for **Express.js**. Brings Next.js-style file-based routing to your Express applications with zero configuration.

[![npm version](https://badge.fury.io/js/%40fs-router%2Fexpress.svg)](https://badge.fury.io/js/%40fs-router%2Fexpress)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Zero Configuration**: Works out of the box with Express
- 📂 **File-System Based**: Define routes by creating files
- 🛠️ **TypeScript Support**: Full TypeScript support with Express types
- ⚡ **Lightweight**: Minimal overhead over native Express routing
- 🔌 **Middleware Support**: Easy middleware integration via `.middleware.ts` files
- 🎯 **Express Native**: Uses Express's native routing under the hood

## Installation

```bash
# npm
npm install @fs-router/express

# yarn
yarn add @fs-router/express

# pnpm
pnpm add @fs-router/express
```

## Quick Start

```typescript
import express from 'express';
import { useFsRouter } from '@fs-router/express';

const app = express();

// Enable JSON parsing
app.use(express.json());

// Set up file-based routing
await useFsRouter(app, {
  routesDir: './routes',
  verbose: true // Optional: enable logging
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## File-Based Routing

### Route Files

Create route files in your `routes` directory:

| File Path | Express Route | Description |
|-----------|---------------|-------------|
| `route.ts` | `/` | Root route |
| `users.route.ts` | `/users` | Simple route |
| `users/route.ts` | `/users` | Alternative syntax |
| `users/[id].route.ts` | `/users/:id` | Dynamic parameter |
| `posts/[...slug].route.ts` | `/posts/*slugs` | Catch-all route |
| `api/v1/users.route.ts` | `/api/v1/users` | Nested route |

### HTTP Methods

Export functions named after HTTP methods:

```typescript
// routes/users/[id].route.ts
import type { Request, Response } from 'express';

export const GET = (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ 
    id, 
    message: `Getting user ${id}` 
  });
};

export const POST = (req: Request, res: Response) => {
  const { id } = req.params;
  const userData = req.body;
  
  res.status(201).json({ 
    id, 
    created: true, 
    data: userData 
  });
};

export const PUT = (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  res.json({ 
    id, 
    updated: true, 
    data: updates 
  });
};

export const DELETE = (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(204).send();
};

// Handle any other HTTP method not explicitly defined
export default (req: Request, res: Response) => {
  res.status(405).json({ 
    error: `Method ${req.method} not allowed` 
  });
};
```

### Middleware

Create middleware files using the `.middleware.ts` suffix:

```typescript
// routes/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No authorization token' });
  }
  
  // Validate token logic here
  console.log('Auth middleware passed');
  next();
};
```

```typescript
// routes/api/rate-limit.middleware.ts
import type { Request, Response, NextFunction } from 'express';

const requests = new Map();

export default (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;
  
  if (!requests.has(ip)) {
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  const clientRequests = requests.get(ip);
  
  if (now > clientRequests.resetTime) {
    clientRequests.count = 1;
    clientRequests.resetTime = now + windowMs;
    return next();
  }
  
  if (clientRequests.count >= maxRequests) {
    return res.status(429).json({ 
      error: 'Too many requests' 
    });
  }
  
  clientRequests.count++;
  next();
};
```

## Advanced Usage

### With TypeScript

```typescript
// routes/users/profile.route.ts
import type { Request, Response } from 'express';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const GET = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    profile: req.user
  });
};

export const PATCH = (req: AuthenticatedRequest, res: Response) => {
  const updates: Partial<User> = req.body;
  
  // Update user logic here
  res.json({
    message: 'Profile updated',
    updates
  });
};
```

### Error Handling

```typescript
// routes/users/[id].route.ts
import type { Request, Response, NextFunction } from 'express';

export const GET = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Simulate async operation
    const user = await getUserById(id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json({ user });
  } catch (error) {
    next(error); // Pass to Express error handler
  }
};
```

### Async Routes

```typescript
// routes/posts.route.ts
import type { Request, Response } from 'express';

export const GET = async (req: Request, res: Response) => {
  try {
    const posts = await fetchPostsFromDatabase();
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch posts' 
    });
  }
};

export const POST = async (req: Request, res: Response) => {
  try {
    const newPost = await createPost(req.body);
    res.status(201).json({ post: newPost });
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to create post' 
    });
  }
};
```

## Integration with Express Features

### With Express Middleware

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

// File-based routes
await useFsRouter(app, {
  routesDir: './routes'
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(3000);
```

### With Express Router

```typescript
import express from 'express';
import { ExpressAdapter } from '@fs-router/express';
import { createRouter } from '@fs-router/core';

const app = express();
const apiRouter = express.Router();

// Set up file-based routing on a sub-router
const adapter = new ExpressAdapter(apiRouter);
await createRouter(adapter, {
  routesDir: './api-routes'
});

app.use('/api', apiRouter);
app.listen(3000);
```

## API Reference

### `useFsRouter(app, options)`

Sets up file-based routing on an Express application.

**Parameters:**
- `app` - Express application instance
- `options.routesDir` - Directory containing route files (required)
- `options.verbose` - Enable verbose logging (optional, default: false)

**Returns:** `Promise<void>`

### `ExpressAdapter`

The underlying adapter class. Use this for advanced customization:

```typescript
import { ExpressAdapter } from '@fs-router/express';
import { createRouter } from '@fs-router/core';

const adapter = new ExpressAdapter(app);
await createRouter(adapter, {
  routesDir: './routes',
  verbose: true
});
```

## Examples

### REST API

```
routes/
├── api/
│   ├── users.route.ts          # GET,POST /api/users
│   ├── users/
│   │   ├── [id].route.ts       # GET,PUT,DELETE /api/users/:id
│   │   └── [id]/
│   │       └── posts.route.ts  # GET,POST /api/users/:id/posts
│   └── auth.middleware.ts      # Middleware for all /api routes
└── health.route.ts             # GET /health
```

### File Upload Route

```typescript
// routes/upload.route.ts
import type { Request, Response } from 'express';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export const POST = [
  upload.single('file'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      originalname: req.file.originalname
    });
  }
];
```

## Migration from Express Router

### Before (Express Router)

```typescript
const router = express.Router();

router.get('/users', (req, res) => {
  res.json({ users: [] });
});

router.get('/users/:id', (req, res) => {
  res.json({ user: { id: req.params.id } });
});

app.use('/api', router);
```

### After (FS Router)

```typescript
// routes/api/users.route.ts
export const GET = (req, res) => {
  res.json({ users: [] });
};

// routes/api/users/[id].route.ts
export const GET = (req, res) => {
  res.json({ user: { id: req.params.id } });
};

// main.ts
await useFsRouter(app, { routesDir: './routes' });
```

## Contributing

This package is part of the Universal FS Router monorepo. Please see the [main repository](https://github.com/sib61/fs-router) for contribution guidelines.

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)