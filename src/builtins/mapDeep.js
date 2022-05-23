import MapExtensionsGraph from "../common/MapExtensionsGraph.js";
import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import MapValuesGraph from "../core/MapValuesGraph.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { getScope } from "../framework/scopeUtilities.js";

/**
 * Map the deep values of a graph with a map function.
 *
 * @this {Explorable}
 */
export default function mapDeep(
  variant,
  mapFn,
  innerExtension,
  outerExtension
) {
  if (!variant) {
    return undefined;
  }
  const extendedMapFn = extendMapFn(mapFn);
  const options = { deep: true };
  if (innerExtension !== undefined) {
    options.innerExtension = innerExtension;
  }
  if (outerExtension !== undefined) {
    options.outerExtension = outerExtension;
  }
  const GraphClass =
    innerExtension === undefined ? MapValuesGraph : MapExtensionsGraph;
  const mappedGraph = new (InheritScopeTransform(GraphClass))(
    variant,
    extendedMapFn,
    options
  );
  if (this) {
    mappedGraph.parent = this;
  }
  return mappedGraph;
}

/**
 * Extend the mapping function so that the scope attached to its execution
 * context includes additional information.
 *
 * @param {Invocable} mapFn
 */
function extendMapFn(mapFn) {
  // Convert the mapFn from an Invocable to a real function.
  /** @type {any} */
  const fn =
    typeof mapFn === "function"
      ? mapFn
      : typeof mapFn === "object" && "toFunction" in mapFn
      ? mapFn.toFunction()
      : ExplorableGraph.canCastToExplorable(mapFn)
      ? ExplorableGraph.toFunction(mapFn)
      : mapFn;

  /**
   * @this {Explorable}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedMapFn(value, key) {
    // Create a scope graph by extending the context graph with the @key and
    // @dot ambient properties.
    let scope = new Scope(
      {
        ".": value ?? null,
        "@key": key,
      },
      getScope(this)
    );

    // Invoke the map function with our newly-created context.
    return fn.call(scope, value, key);
  };
}

mapDeep.usage = `mapDeep <graph>, <mapFn>\tMap the deep values in a graph using a map function.`;
mapDeep.documentation = "https://explorablegraph.org/cli/builtins.html#mapDeep";