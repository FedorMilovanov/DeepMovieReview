/**
 * Teaches the compiled test build the `@/` path alias.
 *
 * `tsconfig.tests.json` inherits `paths` for type-checking only, so a compiled test
 * that pulls in a component used to die on `require("@/components/…")`. The tests
 * already render components; this makes that possible instead of forcing every
 * shared module to use relative imports.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- this file runs as CommonJS
   before the test runner loads, so it cannot be an ES module. */
const Module = require("node:module");
const { resolve } = require("node:path");

const sourceRoot = resolve(".test-build", "src");
const original = Module._resolveFilename;

Module._resolveFilename = function resolveWithAlias(request, parent, isMain, options) {
  if (typeof request === "string" && request.startsWith("@/")) {
    return original.call(this, resolve(sourceRoot, request.slice(2)), parent, isMain, options);
  }
  return original.call(this, request, parent, isMain, options);
};
