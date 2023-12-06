import { Tree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Cast the indicated treelike to a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function tree(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }

  /** @type {AsyncTree} */
  let result = Tree.from(treelike);
  result = Scope.treeWithScope(result, this);
  return result;
}

tree.usage = `from <treelike>\tConvert JSON, YAML, function, or plain object to a tree`;
tree.documentation = "https://graphorigami.org/cli/builtins.html#tree";
