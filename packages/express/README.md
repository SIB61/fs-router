# @fs-router/express

Express adapter for **Universal FS Router**.

## Installation

```bash
pnpm add @fs-router/express
```

## Usage

```typescript
import express from 'express';
import { useFsRouter } from '@fs-router/express';

const app = express();

await useFsRouter(app, {
  routesDir: './routes'
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## File Naming

- `route.ts` -> `/`
- `users.route.ts` -> `/users`
- `users/[id].route.ts` -> `/users/:id`
- `posts/[...slug].route.ts` -> `/posts/*`
- `posts.[postid].route.ts` -> `/posts/:postid`

## Example Route

```typescript
import type { Request, Response } from 'express';

export const GET = (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express!' });
};

export const POST = (req: Request, res: Response) => {
  res.json({ received: req.body });
};
```
