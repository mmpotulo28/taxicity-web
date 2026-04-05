import jsImport from "@eslint/js";
import globals from "globals";
import tseslintImport from "typescript-eslint";
import pluginReactImport from "eslint-plugin-react";
import pluginReactHooksImport from "eslint-plugin-react-hooks";

const tseslint = (tseslintImport as unknown as { default?: typeof tseslintImport }).default ?? tseslintImport;

const js = (jsImport as unknown as { default?: typeof jsImport }).default ?? jsImport;

const pluginReact = (pluginReactImport as unknown as { default?: typeof pluginReactImport }).default ?? pluginReactImport;

const pluginReactHooks =
	(
		pluginReactHooksImport as unknown as {
			default?: typeof pluginReactHooksImport;
		}
	).default ?? pluginReactHooksImport;

const reactFlatConfig = (pluginReact as { configs?: { flat?: { recommended?: object } } }).configs?.flat?.recommended ?? {
	plugins: {
		react: pluginReact,
	},
	rules: {},
};

const tsRecommended = (tseslint as { configs?: { recommended?: object[] } }).configs?.recommended ?? [];

const createConfig = (tseslint as { config?: (...configs: object[]) => object[] }).config ?? ((...configs: object[]) => configs);

export default createConfig(
	{
		ignores: [".next/**", "node_modules/**", "dist/**", "build/**", "coverage/**", "public/**", "**/*.d.ts", "prisma/generated/**"],
	},
	{
		extends: [(js as { configs?: { recommended?: object } }).configs?.recommended ?? {}, ...tsRecommended, reactFlatConfig],
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
