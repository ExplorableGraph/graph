import { Scope } from "@graphorigami/language";
import CacheSite from "../../common/CacheSite.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Caches fetch requests for a standard site.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @param {Treelike} tree
 * @param {Treelike} [cache]
 * @param {Treelike} [filter]
 * @this {AsyncTree|null}
 */
export default async function cacheSite(tree, cache, filter) {
  assertScopeIsDefined(this);
  /** @type {AsyncTree} */
  let result = new CacheSite(tree, cache, filter);
  result = Scope.treeWithScope(result, this);
  return result;
}

cacheSite.usage = `@cache/site site, [cache], [filter]\tCaches site fetch requests`;
cacheSite.documentation = "https://graphorigami.org/cli/builtins.html#@cache";
