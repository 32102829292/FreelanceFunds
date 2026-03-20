import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist" },
  esbuild: { logOverride: { "this-is-undefined-in-esm": "silent" } },
});
