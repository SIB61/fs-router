export interface Logger {
  logRoute(type: 'Middleware' | 'Route', path: string, filePath: string): void;
  logHandler(method: string, path: string, isDefault?: boolean): void;
}

export function createLogger(verbose: boolean): Logger {
  return {
    logRoute(type: 'Middleware' | 'Route', path: string, filePath: string) {
      if (verbose) {
        console.log(`[fs-router] ${type}: ${path} -> ${filePath}`);
      }
    },
    logHandler(method: string, path: string, isDefault = false) {
      if (verbose) {
        const suffix = isDefault ? ' (default handler)' : '';
        console.log(`  ↳ ${method.toUpperCase()} ${path}${suffix}`);
      }
    }
  };
}
