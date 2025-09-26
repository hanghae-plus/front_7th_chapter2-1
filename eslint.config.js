import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  eslintPluginPrettier,
  eslintConfigPrettier,
  {
    plugins: {
      "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        { allowSameFolder: false, rootDir: "src", prefix: "@" },
      ],
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [
            ["@", "./src"],
            ["@components", "./src/components"],
            ["@pages", "./src/pages"],
            ["@api", "./src/api"],
            ["@utils", "./src/utils"],
            ["@store", "./src/store"],
            ["@styles", "./src/styles"],
            ["@mocks", "./src/mocks"],
          ],
          extensions: [".js", ".jsx", ".json"],
        },
      },
    },
  },
];
