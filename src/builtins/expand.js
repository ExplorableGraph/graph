import ExplorableGraph from "../core/ExplorableGraph.js";
import MapValuesGraph from "../core/MapValuesGraph.js";

/**
 * Expand values that can be treated as explorable graphs into graphs.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function expand(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const expanded = new MapValuesGraph(variant, (value) => expandValue(value), {
    deep: true,
  });
  return expanded;
}

function expandValue(value) {
  let result;
  if (ExplorableGraph.canCastToExplorable(value)) {
    try {
      result = ExplorableGraph.from(value);
    } catch (error) {
      result = value;
    }
  } else {
    result = value;
  }
  return result;
}

expand.usage = `expand <graph>\tExpand values that can be treated as explorable graphs into graphs`;
expand.documentation = "https://graphorigami.org/cli/builtins.html#expand";