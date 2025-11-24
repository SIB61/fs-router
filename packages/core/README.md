# @fs-router/core

The core package for **Universal FS Router** - a lightweight, framework-agnostic file-based routing library. This package provides the fundamental parsing logic, type definitions, and adapter interfaces that power all framework-specific implementations.

[![npm version](https://badge.fury.io/js/%40fs-router%2Fcore.svg)](https://badge.fury.io/js/%40fs-router%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔧 **Framework Adapter Interface**: Define custom adapters for any framework
- 📂 **File-System Parser**: Intelligent route parsing from filesystem structure
- 🛠️ **TypeScript First**: Full TypeScript support with comprehensive types
- ⚡ **Lightweight**: Zero dependencies, minimal overhead
- 🔌 **Middleware Support**: Built-in middleware detection and handling

## Installation

```bash
# npm
npm install @fs-router/core

# yarn
yarn add @fs-router/core

# pnpm
pnpm add @fs-router/core
```

## Usage

This package is primarily used for building custom framework adapters. If you're using a supported framework, use the specific adapter instead:

- [`@fs-router/express`](../express) for Express.js
- [`@fs-router/fastify`](../fastify) for Fastify
- [`@fs-router/hono`](../hono) for Hono
- [`@fs-router/koa`](../koa) for Koa

### Creating a Custom Adapter

```typescript
import { createRouter } from '@fs-router/core';
import type { FrameworkAdapter } from '@fs-router/core';

class MyFrameworkAdapter implements FrameworkAdapter {
  constructor(private app: MyFramework) {}

  registerMiddleware(path: string, handler: Function): void {
    // Register middleware with your framework
    this.app.use(path, handler);
  }

  registerRoute(method: string, path: string, handler: Function): void {
    // Register route with your framework
    this.app[method.toLowerCase()](path, handler);
  }

  registerDefaultHandler(path: string, handler: Function, registeredMethods: string[]): void {
    // Handle default exports that should match remaining HTTP methods
    const allMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    const remainingMethods = allMethods.filter(m => !registeredMethods.includes(m));
    
    for (const method of remainingMethods) {
      this.app[method](path, handler);
    }
  }

  transformPath(path: string): string {
    // Transform filesystem paths to framework-specific patterns
    return path; // or apply transformations as needed
  }
}

// Use your adapter
const adapter = new MyFrameworkAdapter(myApp);
await createRouter(adapter, {
  routesDir: './routes',
  verbose: true // Enable logging
});
```

## File-Based Routing Convention

### Route Files

Routes are defined by creating files in your routes directory:

| File Pattern | Route Path | Description |
|--------------|------------|-------------|
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

export const GET = (req, res) => {
  const id = req.params.id;
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
  // Handle any method not explicitly defined above
};
```

### Middleware

Create middleware files using the `.middleware.ts` suffix:

```typescript
// routes/auth.middleware.ts - applies to all routes under /auth
// routes/users/[id].middleware.ts - applies to /users/:id

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
  routesDir: './routes',  // Directory containing route files
  verbose?: boolean       // Enable detailed logging (default: false)
});
```

### `parseRoutes(routesDir, options?)`

Parses the filesystem structure into route definitions.

```typescript
const routes = await parseRoutes('./routes', { verbose: true });
```

### `loadRouteHandlers(routes)`

Loads and imports route handler functions.

```typescript
const routesWithHandlers = await loadRouteHandlers(routes);
```

## Types

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

Configuration options for the router:

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

## Advanced Usage

### Custom Logging

```typescript
import { createLogger } from '@fs-router/core';

const logger = createLogger('MyAdapter', true); // verbose = true
logger.info('Custom adapter initialized');
```

### Route Filtering

You can implement custom route filtering in your adapter:

```typescript
class FilteringAdapter implements FrameworkAdapter {
  constructor(private app: any, private routeFilter?: (route: ParsedRoute) => boolean) {}

  // ... other methods

  async setupRoutes(routes: ParsedRoute[]) {
    const filteredRoutes = this.routeFilter 
      ? routes.filter(this.routeFilter)
      : routes;
    
    // Process filtered routes...
  }
}
```

## Contributing

This package is part of the Universal FS Router monorepo. Please see the [main repository](https://github.com/sib61/fs-router) for contribution guidelines.

## License

MIT © [Universal FS Router](https://github.com/sib61/fs-router)