"use strict";

// Temporary adapter for the pinned ESLint/Next.js toolchain. All actual glob
// matching is done by the fixed upstream minimatch 11, not a copy of v3/v10.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- the legacy consumers require a callable CommonJS export.
const engine = require("minimatch-secure");

function minimatch(path, pattern, options) {
  return engine.minimatch(path, pattern, options);
}

// minimatch 11 removed makeRe(). The pinned eslint-plugin-import uses its
// result only through .test(); expose that narrow interface using the v11
// matcher instead of constructing a potentially backtracking regular expression.
// This is deliberately NOT a general-purpose RegExp implementation.
function makeRe(pattern, options) {
  const matcher = new engine.Minimatch(pattern, options);
  if (matcher.comment || matcher.empty) return false;
  return Object.freeze({
    test(value) {
      return matcher.match(String(value));
    },
  });
}

function defaults(options) {
  if (!options || typeof options !== "object" || !Object.keys(options).length) {
    return minimatch;
  }
  const matchWithDefaults = engine.defaults(options);
  matchWithDefaults.makeRe = (pattern, moreOptions = {}) =>
    makeRe(pattern, { ...options, ...moreOptions });
  matchWithDefaults.defaults = (moreOptions = {}) =>
    defaults({ ...options, ...moreOptions });
  return matchWithDefaults;
}

// Preserve both the old callable CommonJS export and the named exports used
// by newer consumers. The explicit assignments also expose names to Node ESM.
Object.assign(minimatch, engine, { makeRe, defaults });
module.exports = minimatch;
module.exports.minimatch = engine.minimatch;
module.exports.Minimatch = engine.Minimatch;
module.exports.makeRe = makeRe;
module.exports.defaults = defaults;
module.exports.match = engine.match;
module.exports.filter = engine.filter;
module.exports.braceExpand = engine.braceExpand;
module.exports.sep = engine.sep;
module.exports.GLOBSTAR = engine.GLOBSTAR;
module.exports.escape = engine.escape;
module.exports.unescape = engine.unescape;
