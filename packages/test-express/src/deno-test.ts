import express from 'npm:express@^4.18.2';
import { createExpressRouter } from '../../fs-router/dist/express.mjs';

const app = express();

await createExpressRouter(app, { routesDir: './routes', verbose: true });

console.log('Deno + Express test completed successfully!');

Deno.exit(0);
