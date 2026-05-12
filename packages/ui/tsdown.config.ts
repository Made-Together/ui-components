import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/**/*.{ts,tsx}", "!**/*.test.{ts,tsx}"],
  format: ["esm", "cjs"],
  unbundle: true,
  root: "src",
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
});
