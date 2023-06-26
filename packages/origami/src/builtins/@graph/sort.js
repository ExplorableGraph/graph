/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import extendValueKeyFn from "../../common/extendValueKeyFn.js";
import SortTransform from "../../common/SortTransform.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { transformObject } from "../../core/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a new graph with the original's keys sorted
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 * @param {Invocable} [keyFn]
 */
export default async function sort(variant, keyFn) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);

  if (keyFn === undefined) {
    // Simple case: sort by graph's existing keys.
    return transformObject(SortTransform, graph);
  }

  // Complex case: sort by a function that returns a key for each value.
  const result = Object.create(graph);
  const extendedSortFn = extendValueKeyFn(keyFn);

  result.keys = async function () {
    const sorted = [];
    // Get all the keys and map them to their sort keys.
    for (const key of await graph.keys()) {
      const value = await graph.get(key);
      const sortKey = await extendedSortFn.call(this, value, key);
      sorted.push({ key, sortKey });
    }
    // Sort the key/sortKey pairs by sortKey.
    sorted.sort((a, b) => {
      if (a.sortKey < b.sortKey) {
        return -1;
      }
      if (a.sortKey > b.sortKey) {
        return 1;
      }
      return 0;
    });
    // Get the sorted keys
    const keys = sorted.map(({ key }) => key);
    return keys;
  };

  return result;
}

sort.usage = `@sort <graph>, [keyFn]\tReturn a new graph with the original's keys sorted`;
sort.documentation = "https://graphorigami.org/cli/builtins.html#@sort";
