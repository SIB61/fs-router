import type { FastifyInstance } from "fastify";
import type { RouterOptions } from "@fs-router/core";
import { createRouter } from "@fs-router/core";
import { FastifyAdapter } from "./adapter.js";

export async function useFsRouter(
  app: FastifyInstance,
  options: RouterOptions,
) {
  const adapter = new FastifyAdapter(app);
  await createRouter(adapter, options);
}

export { FastifyAdapter } from "./adapter.js";
