# @fs-router/core

Core package for **Universal FS Router** - provides the fundamental parsing logic, type definitions, and adapter interfaces for building file-based routing across any JavaScript framework.

[![npm version](https://badge.fury.io/js/%40fs-router%2Fcore.svg)](https://badge.fury.io/js/%40fs-router%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔧 Framework Adapter Interface
- 📂 Intelligent Route Parsing
- 🛠️ TypeScript First
- ⚡ Zero Dependencies
- 🔌 Built-in Middleware Support
- 🎯 Framework Agnostic

## Installation

```bash
npm install @fs-router/core
# or
yarn add @fs-router/core
# or
pnpm add @fs-router/core
```

## Usage

This package is primarily for building custom framework adapters. For supported frameworks, use the specific adapter:

- [`@fs-router/express`](../express) - Express.js adapter
- [`@fs-router/fastify`](../fastify) - Fastify adapter
- [`@fs-router/hono`](../hono) - Hono adapter
- [`@fs-router/koa`](../koa) - Koa adapter

## Creating a Custom Adapter

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

  registerDefaultHandler(path: string, handler: Function, registeredMethods: string[]): void {
    const allMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    const remaining = allMethods.filter(m => !registeredMethods.includes(m));
    
    for (const method of remaining) {
      this.app[method](path, handler);
    }
  }

  transformPath(path: string): string {
    // Transform filesystem path to framework-specific pattern
    return path;
  }
}

// Use your adapter
const adapter = new MyFrameworkAdapter(myApp);
await createRouter(adapter, {
  routesDir: 'routes', // Use 'src/routes' if using src folder
  verbose: true
});
```

## Route File Conventions

### File Structure to Routes

| File Pattern | Route Path | Description |
|--------------|------------|-------------|
| `route.ts` | `/` | Root route |
| `users.route.ts` | `/users` | Simple route |
| `users/[id].route.ts` | `/users/:id` | Dynamic parameter |
| `posts/[...slug].route.ts` | `/posts/*` | Catch-all route |
| `api/v1/users.route.ts` | `/api/v1/users` | Nested route |

### HTTP Method Exports

```typescript
// routes/users/[id].route.ts

export const GET = (req, res) => {
  // Handle GET request
};

export const POST = async (req, res) => {
  // Handle POST request
};

export const PUT = (req, res) => {
  // Handle PUT request
};

export const DELETE = (req, res) => {
  // Handle DELETE request
};

// Default handler for all other methods
export default (req, res) => {
  // Handle any method not explicitly defined
};
```

### Middleware Files

```typescript
// routes/auth.middleware.ts
export default (req, res, next) => {
  // Middleware logic
  console.log('Middleware executed');
  next();
};
```

## API Reference

### `createRouter(adapter, options)`

Creates and configures routes for the given framework adapter.

```typescript
await createRouter(adapter, {
  routesDir: string;    // Required: Directory containing route files
  verbose?: boolean;    // Optional: Enable detailed logging (default: false)
});
```

### `parseRoutes(routesDir, options?)`

Parses the filesystem structure into route definitions.

```typescript
const routes = await parseRoutes('routes', { verbose: true }); // Use 'src/routes' if using src folder
```

### `loadRouteHandlers(routes)`

Loads and imports route handler functions.

```typescript
const routesWithHandlers = await loadRouteHandlers(routes);
```

## Type Definitions

### `FrameworkAdapter`

Interface that framework adapters must implement:

```typescript
interface FrameworkAdapter<T = any> {
  registerMiddleware(path: string, handler: Function): void;
  registerRoute(method: string, path: string, handler: Function): void;
  registerDefaultHandler(path: string, handler: Function, registeredMethods: string[]): void;
  transformPath(path: string): string;
}
```

### `RouterOptions`

Configuration options:

```typescript
interface RouterOptions {
  routesDir: string;    // Path to routes directory
  verbose?: boolean;    // Enable verbose logging
}
```

### `ParsedRoute`

Represents a parsed route:

```typescript
interface ParsedRoute {
  path: string;           // Original file path
  pattern: string;        // Route pattern (e.g., '/users/:id')
  paramNames: string[];   // Extracted parameter names
  filePath: string;       // Absolute file path
  handlers: RouteHandler; // HTTP method handlers
  isMiddleware: boolean;  // Whether this is middleware
  specificMethod?: string; // For method-specific files
}
```

### `RouteHandler`

HTTP method handlers:

```typescript
interface RouteHandler {
  GET?: Function;
  POST?: Function;
  PUT?: Function;
  DELETE?: Function;
  PATCH?: Function;
  HEAD?: Function;
  OPTIONS?: Function;
  default?: Function;
}
```

## Example REST API Structure

```
routes/
├── api/
│   ├── auth/
│   │   ├── login.route.ts          # POST /api/auth/login
│   │   ├── register.route.ts       # POST /api/auth/register
│   │   ├── refresh.route.ts        # POST /api/auth/refresh
│   │   └── [...rest].middleware.ts # Middleware for /api/auth/* (all auth routes)
│   ├── users/
│   │   ├── route.ts                # GET,POST /api/users
│   │   ├── [id].route.ts           # GET,PUT,DELETE /api/users/:id
│   │   └── [id]/
│   │       └── posts.route.ts      # GET,POST /api/users/:id/posts
│   └── protected.middleware.ts     # Middleware for /api/protected only
├── settings/
│   └── [...rest].route.ts          # GET,POST /settings/* (catch-all)
├── webhooks/
│   └── stripe.route.ts             # POST /webhooks/stripe
└── health.route.ts                 # GET /health
```

## Advanced Usage

### Custom Logging

```typescript
import { createLogger } from '@fs-router/core';

const logger = createLogger('MyAdapter', true); // verbose = true
logger.info('Custom adapter initialized');
```

### Route Filtering

```typescript
class FilteringAdapter implements FrameworkAdapter {
  constructor(
    private app: any,
    private routeFilter?: (route: ParsedRoute) => boolean
  ) {}

  async setupRoutes(routes: ParsedRoute[]) {
    const filtered = this.routeFilter 
      ? routes.filter(this.routeFilter)
      : routes;
    
    // Process filtered routes...
  }
}
```

## Example Adapter Implementations

See the official adapters for reference:

- [Express Adapter](https://github.com/sib61/fs-router/tree/main/packages/express)
- [Fastify Adapter](https://github.com/sib61/fs-router/tree/main/packages/fastify)
- [Hono Adapter](https://github.com/sib61/fs-router/tree/main/packages/hono)
- [Koa Adapter](https://github.com/sib61/fs-router/tree/main/packages/koa)

## Contributing

We welcome contributions! Please visit our [GitHub repository](https://github.com/sib61/fs-router) to:

- 🐛 [Report bugs](https://github.com/sib61/fs-router/issues)
- 💡 [Request features](https://github.com/sib61/fs-router/issues)
- 🔧 [Submit pull requests](https://github.com/sib61/fs-router/pulls)
- 📖 [Contribute adapters for other frameworks](https://github.com/sib61/fs-router/pulls)
- ⭐ Star the project if you find it useful!

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)
