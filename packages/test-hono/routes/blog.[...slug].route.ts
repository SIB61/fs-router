import { Context } from 'hono';

export default function handler(c: Context) {
  const slug = c.req.param('slug');
  console.log(`[GET /blog/${slug}] Catch-all route accessed`);
  return c.json({ message: 'Blog catch-all', slug });
}
