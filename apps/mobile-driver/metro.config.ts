import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { getSentryExpoConfig } from "@sentry/react-native/metro";
import { withNativeWind } from "nativewind/metro";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const baseConfig = getSentryExpoConfig(projectRoot);
const config = {
  ...baseConfig,
  watchFolders: [workspaceRoot, ...(baseConfig.watchFolders || [])],
  resolver: {
    ...(baseConfig.resolver || {}),
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules")
    ]
  }
};

export default withNativeWind(config, {
  input: "./global.css",
  getCSSForPlatform: async () => ""
});
