import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

/* eslint-disable-next-line @typescript-eslint/no-deprecated --
 * TODO: fix deprecated, see: https://typescript-eslint.io/packages/typescript-eslint/#config-deprecated. */
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
    },
});
