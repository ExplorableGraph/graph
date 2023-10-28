import { Tree } from "@graphorigami/async-tree";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return the interior nodes of the tree.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function plain(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  return Tree.plain(treelike);
}

plain.usage = `plain <tree>\tA plain JavaScript object representation of the tree`;
plain.documentation = "https://graphorigami.org/cli/builtins.html#plain";
