import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config({
    files: ["**/*.{js,mjs}"],
    extends: [
        eslint.configs.recommended,
        tseslint.configs.strictTypeChecked,
        tseslint.configs.stylisticTypeChecked,
        eslintPluginPrettierRecommended,
    ],
    languageOptions: { parserOptions: { projectService: true } },
    rules: {
        "prettier/prettier": "warn",

        "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],

        // "This rule requires the `strictNullChecks` compiler option to be turned on to function correctly"
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/no-unnecessary-condition": "off",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
    },
});
