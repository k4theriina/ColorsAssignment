import js from "@eslint/js";
import globals from "globals";

export default [
  {
    // Third-party vendored library; not our code.
    ignores: ["public/js/md5.js", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["public/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        ...globals.browser,
        md5: "readonly",
        // Only used by the guarded `module.exports` at the end of code.js (for Jest).
        module: "readonly",
      },
    },
    rules: {
      // Functions in code.js are called from inline onclick handlers in the HTML.
      "no-unused-vars": ["error", { vars: "local" }],
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["tests/**/*.js", "jest.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
      },
    },
  },
];
