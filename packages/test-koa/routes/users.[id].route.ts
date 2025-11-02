import type { Context } from 'koa';

export default async function handler(ctx: Context) {
  const id = ctx.params.id;
  console.log(`[GET /users/${id}] User detail route accessed`);
  ctx.body = { message: 'User detail', userId: id };
}
