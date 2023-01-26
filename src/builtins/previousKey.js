import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Returns the key before the indicated key.
 *
 * @param {GraphVariant} variant
 * @param {any} key
 * @this {Explorable}
 */
export default async function previousKey(variant, key) {
  const graph = ExplorableGraph.from(variant);
  let previousKey = undefined;
  for await (const graphKey of graph) {
    if (graphKey === key) {
      return previousKey;
    }
    previousKey = graphKey;
  }
  return undefined;
}

previousKey.usage = `previousKey <graph>, <key>\tReturns the key before the indicated key`;
previousKey.documentation =
  "https://graphorigami.org/cli/builtins.html#previousKey";