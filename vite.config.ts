import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "build",
    minify: false,
  },
  publicDir: "static",
  base: "/Luminight",
});
