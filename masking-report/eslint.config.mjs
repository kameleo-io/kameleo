import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

/* eslint-disable-next-line @typescript-eslint/no-deprecated --
 * TODO: fix deprecated, see: https://typescript-eslint.io/packages/typescript-eslint/#config-deprecated. */
export default tseslint.config(
    { ignores: ["dist", "playwright-report"] },
    {
        files: ["**/*.{ts,js,mjs}"],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            eslintPluginPrettierRecommended,
        ],
        plugins: { import: importPlugin, "simple-import-sort": simpleImportSort },
        languageOptions: { parserOptions: { projectService: true } },
        rules: {
            // additional rules
            "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
            "@typescript-eslint/explicit-member-accessibility": "error",

            /// stylistic rules
            "import/first": "warn",
            "import/newline-after-import": "warn",
            "import/no-duplicates": "warn",
            "simple-import-sort/imports": "warn",
            "simple-import-sort/exports": "warn",

            "prettier/prettier": "warn",

            /// rules that we make less strict
            "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
            "@typescript-eslint/no-base-to-string": "off",
        },
    },
    {
        files: ["build/**/*.{ts,js,mjs}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: ["../utils/*", "../utils/**", "../tests/*", "../tests/**"],
                },
            ],
        },
    },
    {
        files: ["**/*.{ts,js,mjs}"],
        ignores: ["build/**/*.{ts,js,mjs}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: ["./build/*", "./build/**", "../build/*", "../build/**", "build/*", "build/**"],
                },
            ],
        },
    },
);
