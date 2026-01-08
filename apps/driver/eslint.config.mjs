import sharedConfig from "@taxicity/configs/eslint";

export default [
	...sharedConfig,
	{
		ignores: [".next/**"],
	},
];
