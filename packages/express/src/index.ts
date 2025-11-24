import type { Application } from "express";
import type { RouterOptions } from "@fs-router/core";
import { createRouter } from "@fs-router/core";
import { ExpressAdapter } from "./adapter.js";

export async function useFsRouter(app: Application, options: RouterOptions) {
  const adapter = new ExpressAdapter(app);
  await createRouter(adapter, options);
}

export { ExpressAdapter } from "./adapter.js";
