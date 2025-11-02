import { parseRoutes } from '../src/parser.js';
import { join } from 'node:path';

const testCases = [
  '../test-express/routes',
];

for (const testCase of testCases) {
  console.log(`\n=== Testing: ${testCase} ===\n`);

  try {
    const routes = parseRoutes(testCase);

    console.log(`Found ${routes.length} route(s):\n`);

    for (const route of routes) {
      console.log(JSON.stringify({
        path: route.path,
        paramNames: route.paramNames,
        isMiddleware: route.isMiddleware,
        filePath: route.filePath.replace(process.cwd(), '.')
      }, null, 2));
      console.log('');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
