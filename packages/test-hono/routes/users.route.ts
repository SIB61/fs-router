import { Context } from 'hono';

export default function handler(c: Context) {
  console.log('[GET /users] Users list route accessed');
  return c.json({ message: 'List of users', users: ['Alice', 'Bob', 'Charlie'] });
}
