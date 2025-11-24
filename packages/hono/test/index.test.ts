import { describe, it, expect } from "vitest";
import { useFsRouter, HonoAdapter } from "../src/index.js";

describe("fs-router-hono", () => {
  it("should export createHonoRouter function", () => {
    expect(typeof useFsRouter).toBe("function");
  });

  it("should export HonoAdapter class", () => {
    expect(typeof HonoAdapter).toBe("function");
  });
});
