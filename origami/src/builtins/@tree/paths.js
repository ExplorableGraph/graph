import { Tree } from "@graphorigami/async-tree";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return an array of paths to the values in the tree.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 * @param {string} [prefix]
 */
export default async function paths(treelike, prefix = "") {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const result = [];
  const tree = Tree.from(treelike);
  for (const key of await tree.keys()) {
    const valuePath = prefix ? `${prefix}/${key}` : key;
    const value = await tree.get(key);
    if (await Tree.isAsyncTree(value)) {
      const subPaths = await paths.call(this, value, valuePath);
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}

paths.usage = `paths(tree)\tReturn an array of paths to the values in the tree`;
