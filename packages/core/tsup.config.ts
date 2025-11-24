import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  minify: false,
  target: "node16",
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
  esbuildOptions(options) {
    options.platform = "node";
  },
});
