import path from "node:path";
import { getSentryExpoConfig } from "@sentry/react-native/metro.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getSentryExpoConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot, ...(config.watchFolders || [])];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules"), path.resolve(workspaceRoot, "node_modules")];

// 3. Force Metro to resolve (sub)dependencies from the `node_modules`
// config.resolver.disableHierarchicalLookup = true;

export default config;
