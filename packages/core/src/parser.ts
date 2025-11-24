import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import type { ParsedRoute, RouteHandler } from './types.js';

declare const Deno: any;

const isNode = typeof process !== 'undefined' && process.versions?.node;
const isBun = typeof process !== 'undefined' && process.versions?.bun;
const isDeno = typeof Deno !== 'undefined';

function getCwd(): string {
  if (isDeno) {
    return Deno.cwd();
  }
  return process.cwd();
}

function readDirSync(path: string): string[] {
  if (isDeno) {
    const entries: string[] = [];
    for (const entry of Deno.readDirSync(path)) {
      entries.push(entry.name);
    }
    return entries;
  }
  return readdirSync(path);
}

function getStatSync(path: string): { isDirectory: () => boolean } {
  if (isDeno) {
    const stat = Deno.statSync(path);
    return {
      isDirectory: () => stat.isDirectory
    };
  }
  return statSync(path);
}

function pathJoin(...paths: string[]): string {
  if (isDeno) {
    return paths.join('/').replace(/\/+/g, '/');
  }
  return join(...paths);
}

function pathRelative(from: string, to: string): string {
  if (isDeno) {
    const fromParts = from.split('/');
    const toParts = to.split('/');
    let i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
      i++;
    }
    const upCount = fromParts.length - i;
    const remainingPath = toParts.slice(i);
    return '../'.repeat(upCount) + remainingPath.join('/');
  }
  return relative(from, to);
}

function pathResolve(...paths: string[]): string {
  if (isDeno) {
    let resolved = paths[0];
    for (let i = 1; i < paths.length; i++) {
      const path = paths[i];
      if (path.startsWith('/')) {
        resolved = path;
      } else {
        resolved = resolved + '/' + path;
      }
    }
    return resolved.replace(/\/+/g, '/');
  }
  return resolve(...paths);
}

function getPathSep(): string {
  if (isDeno) {
    return '/';
  }
  return sep;
}

export function parseRoutes(routesDir: string): ParsedRoute[] {
  routesDir = pathResolve(getCwd(), routesDir);
  const routes: ParsedRoute[] = [];
  
  function scanDirectory(dir: string) {
    const entries = readDirSync(dir);
    
    for (const entry of entries) {
      const fullPath = pathJoin(dir, entry);
      const stat = getStatSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.endsWith('.route.ts') || entry.endsWith('.route.js') || 
                 entry.endsWith('.middleware.ts') || entry.endsWith('.middleware.js') ||
                 entry === 'route.ts' || entry === 'route.js') {
        const route = parseRouteFile(fullPath, routesDir);
        if (route) {
          routes.push(route);
        }
      }
    }
  }
  
  scanDirectory(routesDir);
  return routes.sort((a, b) => {
    if (a.isMiddleware && !b.isMiddleware) return -1;
    if (!a.isMiddleware && b.isMiddleware) return 1;
    const aDepth = a.path.split('/').length;
    const bDepth = b.path.split('/').length;
    if (aDepth !== bDepth) return bDepth - aDepth;
    return b.path.localeCompare(a.path);
  });
}

function parseRouteFile(filePath: string, routesDir: string): ParsedRoute | null {
  const relativePath = pathRelative(routesDir, filePath);
  const isMiddleware = filePath.endsWith('.middleware.ts') || filePath.endsWith('.middleware.js');
  
  let pathPart = relativePath
    .replace(/\.middleware\.(ts|js)$/, '')
    .replace(/\.route\.(ts|js)$/, '')
    .replace(/\/route\.(ts|js)$/, '')
    .replace(/^route\.(ts|js)$/, '');
  
  const parts = pathPart.split(getPathSep()).filter(p => p && p !== 'index');
  const paramNames: string[] = [];
  const convertedParts: string[] = [];
  
  let hasCatchAll = false;
  
  for (const part of parts) {
    const segments: string[] = [];
    let currentSegment = '';
    let inBrackets = false;
    
    for (let i = 0; i < part.length; i++) {
      const char = part[i];
      
      if (char === '[') {
        inBrackets = true;
        currentSegment += char;
      } else if (char === ']') {
        inBrackets = false;
        currentSegment += char;
      } else if (char === '.' && !inBrackets) {
        if (currentSegment) {
          segments.push(currentSegment);
          currentSegment = '';
        }
      } else {
        currentSegment += char;
      }
    }
    
    if (currentSegment) {
      segments.push(currentSegment);
    }
    
    for (const segment of segments) {
      if (segment.startsWith('[...') && segment.endsWith(']')) {
        const paramName = segment.slice(4, -1);
        paramNames.push(paramName);
        hasCatchAll = true;
        break;
      } else if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1);
        paramNames.push(paramName);
        convertedParts.push(`:${paramName}`);
      } else if (segment) {
        convertedParts.push(segment);
      }
    }
    if (hasCatchAll) break;
  }
  
  let path = '/' + convertedParts.join('/');
  path = path.replace(/\/+/g, '/');
  
  if (hasCatchAll) {
    path = path + '/*';
  }
  
  return {
    path,
    pattern: path,
    paramNames,
    filePath,
    handlers: {},
    isMiddleware,
    specificMethod: undefined
  };
}

export async function loadRouteHandlers(route: ParsedRoute): Promise<ParsedRoute> {
  const importPath = isDeno ? `file://${route.filePath}` : route.filePath;
  const module = await import(importPath);
  
  route.handlers = {
    GET: module.GET,
    POST: module.POST,
    PUT: module.PUT,
    DELETE: module.DELETE,
    PATCH: module.PATCH,
    HEAD: module.HEAD,
    OPTIONS: module.OPTIONS,
    default: module.default
  };
  
  return route;
}
