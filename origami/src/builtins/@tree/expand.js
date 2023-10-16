import { Tree } from "@graphorigami/core";
import MapValuesTree from "../../common/MapValuesTree.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Expand values that can be treated as trees into trees.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 */
export default async function expand(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const expanded = new MapValuesTree(treelike, (value) => expandValue(value), {
    deep: true,
  });
  return expanded;
}

function expandValue(value) {
  let result;
  if (Tree.isTreelike(value)) {
    try {
      result = Tree.from(value);
    } catch (error) {
      result = value;
    }
  } else {
    result = value;
  }
  return result;
}

expand.usage = `@tree/expand <tree>\tExpand values that can be treated as trees`;
expand.documentation = "https://graphorigami.org/cli/builtins.html#@tree";
