import type { Context } from 'koa';

export default async function handler(ctx: Context) {
  console.log('[GET /] Root route accessed');
  ctx.body = { message: 'Root route', timestamp: new Date().toISOString() };
}
