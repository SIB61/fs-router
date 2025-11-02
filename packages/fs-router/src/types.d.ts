export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
export interface RouteHandler {
    GET?: Function;
    POST?: Function;
    PUT?: Function;
    DELETE?: Function;
    PATCH?: Function;
    HEAD?: Function;
    OPTIONS?: Function;
    default?: Function;
}
export interface ParsedRoute {
    path: string;
    pattern: string;
    paramNames: string[];
    filePath: string;
    handlers: RouteHandler;
    isMiddleware: boolean;
}
export interface RouterOptions {
    routesDir: string;
    verbose?: boolean;
}
//# sourceMappingURL=types.d.ts.map