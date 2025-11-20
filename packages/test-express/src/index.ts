import express from 'express';
import { createExpressRouter } from '@fs-router/express';

const app = express();

await createExpressRouter(app, { routesDir: './routes', verbose: true });

app.listen(3000, () => {
  console.log('Express server running on http://localhost:3000');
});
