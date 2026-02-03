const path = require("node:path");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

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

module.exports = config;
