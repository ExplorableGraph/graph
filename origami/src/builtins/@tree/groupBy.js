import { Tree, groupBy } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import addValueKeyToScope from "../../common/addValueKeyToScope.js";
import { toFunction } from "../../common/utilities.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return a new tree with the values from the original tree in groups.
 * The groups are determined by the given function.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @typedef {import("../../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {Invocable} groupKeyFn
 */
export default async function groupByBuiltin(treelike, groupKeyFn) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  const tree = Tree.from(treelike);

  const fn = toFunction(groupKeyFn);
  const baseScope = Scope.getScope(this);
  async function extendedGroupKeyFn(value, key, tree) {
    const scope = addValueKeyToScope(baseScope, value, key);
    const sortKey = await fn.call(scope, value, key);
    return sortKey;
  }

  const grouped = await groupBy(extendedGroupKeyFn)(tree);
  const scoped = Scope.treeWithScope(grouped, this);
  return scoped;
}

groupByBuiltin.usage = `groupBy <tree>, [groupKeyFn]\tReturn a new tree with the original's values grouped`;
groupByBuiltin.documentation =
  "https://graphorigami.org/cli/builtins.html#@group";