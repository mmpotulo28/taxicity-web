import sharedConfig from "@taxicity/eslint-config";

export default [
  ...sharedConfig,
  {
      ignores: [".next/**"]
  }
];
