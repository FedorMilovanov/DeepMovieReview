import assert from "node:assert/strict";
import postcss from "postcss";

// Retain the existing compatibility definitions, but all source CSS now uses
// canonical tokens directly. Governance forbids new alias uses or overrides.
export const legacyAliases = {
  "--bg": "--surface-canvas",
  "--bg-elevated": "--surface-1",
  "--bg-soft": "--surface-2",
  "--text": "--ink-1",
  "--muted": "--ink-3",
  "--line": "--stroke-default",
  "--line-strong": "--stroke-strong",
  "--crimson": "--accent-fracture",
  "--amber": "--accent-restoration",
  "--display": "--font-display",
  "--body": "--font-body",
  "--max": "--container-max",
  "--pad": "--gutter",
};

export function assertAliasBridge(css) {
  const tree = postcss.parse(css);
  for (const [alias, canonical] of Object.entries(legacyAliases)) {
    const declarations = [];
    tree.walkDecls(alias, (declaration) => declarations.push(declaration));
    assert.equal(declarations.length, 1, `${alias}: keep one compatibility definition`);
    const declaration = declarations[0];
    assert.equal(declaration.parent.selector, ":root", `${alias}: bridge belongs to root`);
    assert.equal(declaration.value, `var(${canonical})`, `${alias}: must map to ${canonical}`);
    let canonicalExists = false;
    tree.walkDecls(canonical, (node) => {
      if (node.parent.selector === ":root") canonicalExists = true;
    });
    assert.ok(canonicalExists, `${alias}: missing canonical token ${canonical}`);
  }
}

export function assertCanonicalUsage(css, path, { allowLegacyDefinitions = false } = {}) {
  postcss.parse(css).walkDecls((declaration) => {
    assert.ok(allowLegacyDefinitions || !legacyAliases[declaration.prop],
      `${path}: do not redefine legacy alias ${declaration.prop} outside the compatibility bridge`);
    for (const match of declaration.value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const canonical = legacyAliases[match[1]];
      assert.ok(!canonical, `${path}: use ${canonical} instead of ${match[1]}`);
    }
  });
}
