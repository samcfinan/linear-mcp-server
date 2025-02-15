import pluginJs from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unused-imports": "error",
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            { from: "package", name: "it", package: "node:test" },
            { from: "package", name: "describe", package: "node:test" },
            { from: "package", name: "before", package: "node:test" },
            { from: "package", name: "after", package: "node:test" },
            { from: "package", name: "beforeEach", package: "node:test" },
            { from: "package", name: "afterEach", package: "node:test" },
          ],
        },
      ],
      "no-console": "error",
    },
  },
  {
    ignores: ["dist", "eslint.config.mjs"],
  },
)
