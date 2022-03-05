import path from "path";
import builtins from "../cli/builtins.js";
import defaultModuleExport from "../cli/defaultModuleExport.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ParentFiles from "../node/ParentFiles.js";

const configFileName = "eg.config.js";

// Load config file.
export default async function config(relativePath = "") {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  const parentFiles = new ParentFiles(resolvedPath);
  const configPath = await parentFiles.get(configFileName);
  const fn = configPath ? await defaultModuleExport(configPath) : null;
  const graph = fn ? ExplorableGraph.from(fn) : null;

  // Prefer user's config if one was found, otherwise use builtins.
  return graph || builtins;
}

config.usage = `config\tReturn the graph for the active eg configuration`;
config.documentation = "https://explorablegraph.org/pika/builtins.html#config";