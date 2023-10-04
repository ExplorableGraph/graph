import { Graph } from "@graphorigami/core";
import * as YAMLModule from "yaml";
import { parseYaml } from "../common/serialize.js";

// See notes at serialize.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Load a file as YAML.
 *
 * @type {import("../../index.js").FileUnpackFunction}
 */
export default function unpackYaml(input, options = {}) {
  const { parent } = options;
  const result = parseYaml(String(input));
  if (Graph.isAsyncDictionary(result)) {
    /** @type {any} */ (result).parent = parent;
  }
  return result;
}
