import * as YAMLModule from "yaml";
import ExpressionGraph from "../common/ExpressionGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import {
  getScope,
  isPlainObject,
  keySymbol,
  parseYaml,
  transformObject,
} from "../core/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Load a file as YAML.
 *
 * @param {string|HasString|GraphVariant} input
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadYaml(input, key) {
  // If the input is a graph variant, return it as is. This situation can arise
  // when an Origami graph contains an assigment whose right-hand side is a
  // graph and whose left-hand side a name ending in `.yaml`. In that situation,
  // we return the input as is, and rely on the ori CLI or the server to
  // eventually render the graph to YAML.
  if (ExplorableGraph.canCastToExplorable(input)) {
    return input;
  }

  const text = String(input);
  const data = parseYaml(text);

  const textWithGraph = new String(text);
  const scope = getScope(this);
  let graph;

  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!graph) {
      if (isPlainObject(data) || data instanceof Array) {
        graph = new (FileTreeTransform(ExpressionGraph))(data);
      } else if (!("parent" in graph)) {
        graph = transformObject(FileTreeTransform, graph);
      }
      graph.parent = scope;
      graph[keySymbol] = key;
    }
    return graph;
  };

  return textWithGraph;
}
