/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable spaced-comment */
/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import path from "path";

import { defineConfig } from "vite";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "crossDomainUtil",
      fileName: (format) => `cross-domain-utils.${format}.js`,
      formats: ["es", "umd"],
    },
    sourcemap: true,
    rollupOptions: {
      ouput: {
        preserveModules: true,
      },
    },
  },
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
  },
});
