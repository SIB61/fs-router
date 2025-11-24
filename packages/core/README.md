# @fs-router/core

Core package for **Universal FS Router**. Contains the route parser, type definitions, and adapter interfaces.

## Installation

```bash
pnpm add @fs-router/core
```

## Usage

This package is primarily used when building custom adapters for frameworks.

```typescript
import { parseRoutes, loadRouteHandlers, createRouter } from '@fs-router/core';
import type { FrameworkAdapter } from '@fs-router/core';

// Implement your adapter
class MyAdapter implements FrameworkAdapter {
  // ... implementation
}

// Use it
const adapter = new MyAdapter();
await createRouter(adapter, { routesDir: './routes' });
```

## File Naming

- `route.ts` -> `/`
- `users.route.ts` -> `/users`
- `users/[id].route.ts` -> `/users/:id`
- `posts/[...slug].route.ts` -> `/posts/*`
- `posts.[postid].route.ts` -> `/posts/:postid`

## Example Route

Route handlers depend on the adapter implementation. Generally, they export functions corresponding to HTTP methods.

```typescript
// routes/example.route.ts

export const GET = (req, res) => {
  // ... handle request
};
```
