import sharedConfig from "@taxiciti/configs/eslint";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
	...sharedConfig,
	{
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.json"],
				tsconfigRootDir: __dirname,
			},
		},
		ignores: [".next/**"],
	},
	{
		files: ["*.config.js", "*.config.mjs", "*.config.ts"],
		languageOptions: {
			parserOptions: {
				project: null,
			},
		},
	},
];
