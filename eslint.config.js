import js from "@eslint/js";
import ts from "typescript-eslint";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...ts.configs.strict,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
    rules: {
      "no-undef": 0,
    },
  },
  {
    ignores: ["build/"],
  },
];
