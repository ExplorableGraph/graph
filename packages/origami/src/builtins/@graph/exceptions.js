import { DictionaryHelpers, GraphHelpers } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import defineds from "./defineds.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} variant
 */
export default async function exceptions(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  const exceptionsGraph = new ExceptionsGraph(variant);
  return defineds.call(this, exceptionsGraph);
}

class ExceptionsGraph {
  constructor(variant) {
    this.graph = GraphHelpers.from(variant);
  }

  async get(key) {
    try {
      const value = await this.graph.get(key);
      return DictionaryHelpers.isAsyncDictionary(value)
        ? Reflect.construct(this.constructor, [value])
        : undefined;
    } catch (/** @type {any} */ error) {
      return error.name && error.message
        ? `${error.name}: ${error.message}`
        : error.name ?? error.message ?? error;
    }
  }

  async keys() {
    return this.graph.keys();
  }
}

exceptions.usage = `@graph/exceptions graph\tReturn a graph of exceptions thrown in the graph`;
exceptions.documentation =
  "https://graphorigami.org/cli/builtins.html#exceptions";