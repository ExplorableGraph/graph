import { FunctionTree } from "@weborigami/async-tree";
import { toFunction } from "../common/utilities.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Create a tree from a function and a set of keys.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Invocable} [invocable]
 */
export default async function fromFn(invocable, keys = []) {
  assertTreeIsDefined(this, "tree:fromFn");
  if (invocable === undefined) {
    throw new Error(
      "An Origami function was called with an initial argument, but its value is undefined."
    );
  }
  const fn = toFunction(invocable);
  const tree = new FunctionTree(fn, keys);
  tree.parent = this;
  return tree;
}

fromFn.usage = `@fnTree <fn>, [<keys>]\tCreate a tree from a function and a set of keys`;
fromFn.documentation = "https://weborigami.org/cli/tree.html#fn";
