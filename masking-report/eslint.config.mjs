import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import-x";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default defineConfig(
    { ignores: ["dist", "playwright-report"] },
    {
        files: ["**/*.{ts,mts,js,mjs}"],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            eslintPluginPrettierRecommended,
        ],
        plugins: { "import-x": importPlugin, "simple-import-sort": simpleImportSort },
        languageOptions: { parserOptions: { projectService: true } },
        rules: {
            // additional rules
            "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
            "@typescript-eslint/explicit-member-accessibility": "error",
            eqeqeq: ["error"],

            /// stylistic rules
            "import-x/first": "warn",
            "import-x/newline-after-import": "warn",
            "import-x/no-duplicates": "warn",
            "simple-import-sort/imports": "warn",
            "simple-import-sort/exports": "warn",

            "prettier/prettier": "warn",

            /// rules that we make less strict
            "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
            "@typescript-eslint/no-base-to-string": "off",
        },
    },
    // forbid importing from the outside in build/
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
    // forbid importing build/ from non-build files
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
