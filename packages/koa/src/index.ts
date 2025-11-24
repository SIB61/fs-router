import type Router from "@koa/router";
import type { RouterOptions } from "@fs-router/core";
import { createRouter } from "@fs-router/core";
import { KoaAdapter } from "./adapter.js";

export async function useFsRouter(router: Router, options: RouterOptions) {
  const adapter = new KoaAdapter(router);
  await createRouter(adapter, options);
}

export { KoaAdapter } from "./adapter.js";
