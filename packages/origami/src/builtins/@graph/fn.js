import { FunctionGraph } from "@graphorigami/core";
import { graphInContext, toFunction } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Create a graph from a function and a set of keys.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @typedef {import("../../..").Invocable} Invocable
 *
 * @this {AsyncDictionary|null}
 * @param {Invocable} [invocable]
 */
export default async function fn(invocable, keys = []) {
  assertScopeIsDefined(this);
  invocable = invocable ?? (await this?.get("@current"));
  if (invocable === undefined) {
    return undefined;
  }
  const invocableFn = toFunction(invocable);

  /** @this {AsyncDictionary|null} */
  async function extendedFn(key) {
    const scope = this;
    const ambientsGraph = graphInContext(
      {
        "@key": key,
      },
      scope
    );
    return invocableFn.call(ambientsGraph, key);
  }

  return new FunctionGraph(extendedFn, keys);
}

fn.usage = `fn <fn>, [<keys>]\tCreate a graph from a function and a set of keys`;
fn.documentation = "https://graphorigami.org/cli/graph.html#fn";