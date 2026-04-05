import path from "node:path";
import { getSentryExpoConfig } from "@sentry/react-native/metro";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getSentryExpoConfig(projectRoot);

export default {
...config,
watchFolders: [workspaceRoot, ...(config.watchFolders || [])],
resolver: {
...(config.resolver || {}),
nodeModulesPaths: [path.resolve(projectRoot, "node_modules"), path.resolve(workspaceRoot, "node_modules")],
},
};
