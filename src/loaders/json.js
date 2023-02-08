import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

/**
 * Load a file as YAML.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadJson(buffer, key) {
  const text = String(buffer);
  const textWithGraph = new String(text);
  const scope = this;
  let graph;

  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!graph) {
      graph = ExplorableGraph.fromJson(text);
      if (!("parent" in graph)) {
        graph = transformObject(InheritScopeTransform, graph);
      }
      graph.parent = scope;
    }
    return graph;
  };

  return textWithGraph;
}
