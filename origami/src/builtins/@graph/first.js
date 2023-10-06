import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the first value in the graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [variant]
 */
export default async function first(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = Graph.from(variant);
  for (const key of await graph.keys()) {
    // Just return first value immediately.
    const value = await graph.get(key);
    return value;
  }
  return undefined;
}

first.usage = `first <graph>\tReturns the first value in the graph.`;
first.documentation = "https://graphorigami.org/cli/builtins.html#first";