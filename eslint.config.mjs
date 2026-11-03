import { defineConfig, globalIgnores } from "eslint/config";
import next from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import reactCompat from "./scripts/lint-rules/react-policy.mjs";
import a11y from "eslint-plugin-jsx-a11y-x";
import tseslint from "typescript-eslint";
import globals from "globals";

// Keep Next, React Hooks, TypeScript and the six Next accessibility rules.
// The remaining React/import rules run in .oxlintrc.json; the two gaps found
// by differential fixtures are kept in the local React policy plugin.
export default defineConfig([
  {
    name: "next-compatible",
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    plugins: { "@next/next": next, "react-hooks": reactHooks, project: reactCompat, "jsx-a11y": a11y },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "project/no-deprecated-react-api": "error",
      "project/no-anonymous-default-memo": "error",
      "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", ".test-build/**", ".audit-build/**", "next-env.d.ts"]),
]);
