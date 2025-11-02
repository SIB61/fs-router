import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';
const files = readdirSync(distDir).filter(f => f.endsWith('.mjs') || f.endsWith('.js'));

for (const file of files) {
  const filePath = join(distDir, file);
  let content = readFileSync(filePath, 'utf-8');
  
  content = content.replace(/from ["']fs["']/g, 'from "node:fs"');
  content = content.replace(/from ["']path["']/g, 'from "node:path"');
  
  writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed imports in ${file}`);
}

console.log('All imports fixed for cross-runtime compatibility');
