/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable spaced-comment */
/* eslint-disable import/no-default-export */
/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

/* @flow */

import { defineConfig } from "vite";
import { flowPlugin, esbuildFlowPlugin } from "@bunchtogether/vite-plugin-flow";

const define = {
  __DEBUG__: false,
};

// $FlowIssue
export default defineConfig({
  esbuild: {
    define,
  },
  define,
  test: {
    clearMocks: true,
    coverage: {
      reporter: ["text", "lcov"],
    },
    environment: "jsdom",
    setupFiles: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildFlowPlugin()],
    },
  },
  plugins: [
    // $FlowIssue
    flowPlugin({
      exclude: "",
    }),
  ],
});
