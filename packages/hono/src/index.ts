import type { Hono } from "hono";
import type { RouterOptions } from "@fs-router/core";
import { createRouter } from "@fs-router/core";
import { HonoAdapter } from "./adapter.js";

export async function useFsRouter(app: Hono, options: RouterOptions) {
  const adapter = new HonoAdapter(app);
  await createRouter(adapter, options);
}

export { HonoAdapter } from "./adapter.js";
