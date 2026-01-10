import config from "@taxicity/configs/eslint";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
	...config,
	{
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.json"],
				tsconfigRootDir: __dirname,
			},
		},
	},
	{
		files: ["*.config.js", "*.config.mts"],
		languageOptions: {
			parserOptions: {
				project: null,
			},
		},
	},
];
