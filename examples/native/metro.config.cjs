const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const repositoryRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

// This standalone example reads library source outside its project root.
// Keep every runtime dependency in the app, including imports from that source.
config.watchFolders = [repositoryRoot];
config.resolver.nodeModulesPaths = [path.join(projectRoot, "node_modules")];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@mingu/interaction-ui/native") {
    return {
      type: "sourceFile",
      filePath: path.join(repositoryRoot, "packages/native/src/index.ts"),
    };
  }
  const fromLibrary = context.originModulePath.startsWith(
    path.join(repositoryRoot, "packages") + path.sep,
  );
  const isBare = !moduleName.startsWith(".") && !path.isAbsolute(moduleName);
  if (fromLibrary && isBare) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, "index.ts") },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
