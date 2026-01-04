import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
	{
		ignores: [".next/**", "node_modules/**", "dist/**", "build/**", "coverage/**", "public/**", "**/*.d.ts", "prisma/generated/**"],
	},
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended, pluginReact.configs.flat.recommended],
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			"react-hooks": pluginReactHooks,
		},
		rules: {
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			"no-undef": "off",
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},
	{
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		rules: {
			"@typescript-eslint/no-require-imports": "off",
		},
	},
);
