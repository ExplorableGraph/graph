import {
  cachedKeyFunctions,
  isPlainObject,
  keyFunctionsForExtensions,
  mapFn,
} from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import { toFunction } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Return a function that transforms a tree of keys and values to a new tree of
 * keys and values.
 *
 * @typedef {import("@weborigami/async-tree").KeyFn} KeyFn
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/async-tree").TreeTransform} TreeTransform
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @typedef {{ deep?: boolean, description?: string, extension?: string,
 * extensions?: string, inverseKey?: KeyFn, key?: ValueKeyFn, keyMap?:
 * ValueKeyFn, needsSourceValue?: boolean, value?: ValueKeyFn, valueMap?:
 * ValueKeyFn }} MapOptionsDictionary
 *
 * @this {AsyncTree|null}
 * @param {ValueKeyFn|MapOptionsDictionary} operation
 */
export default function mapFnBuiltin(operation) {
  assertScopeIsDefined(this, "map");
  const scope = this;

  // Identify whether the map instructions take the form of a value function or
  // a dictionary of options.
  /** @type {MapOptionsDictionary} */
  let options;
  /** @type {ValueKeyFn|undefined} */
  let valueFn;
  if (isPlainObject(operation)) {
    // @ts-ignore
    options = operation;
    valueFn = options?.value ?? options?.valueMap;
  } else if (
    typeof operation === "function" ||
    typeof (/** @type {any} */ (operation)?.unpack) === "function"
  ) {
    valueFn = operation;
    options = {};
  } else {
    throw new TypeError(
      `@mapFn: You must specify a value function or options dictionary as the first parameter.`
    );
  }

  let { deep, description, inverseKey, needsSourceValue } = options;
  let extension = options.extension ?? options.extensions;
  let keyFn = options.keyMap ?? options.key;

  description ??= `@mapFn ${extension ?? ""}`;

  if (extension && (keyFn || inverseKey)) {
    throw new TypeError(
      `@mapFn: You can't specify extensions and also a key or inverseKey function`
    );
  }

  // Extend the value function to include the value and key in scope.
  let extendedValueFn;
  if (valueFn) {
    const resolvedValueFn = toFunction(valueFn);
    extendedValueFn = (sourceValue, sourceKey, tree) =>
      resolvedValueFn.call(scope, sourceValue, sourceKey, tree);
  }

  // Extend the key function to include the value and key in scope.
  let extendedKeyFn;
  let extendedInverseKeyFn;
  if (extension) {
    let { resultExtension, sourceExtension } = parseExtensions(extension);
    const keyFns = keyFunctionsForExtensions({
      resultExtension,
      sourceExtension,
    });
    extendedKeyFn = keyFns.key;
    extendedInverseKeyFn = keyFns.inverseKey;
  } else if (keyFn) {
    const resolvedKeyFn = toFunction(keyFn);
    async function scopedKeyFn(sourceKey, tree) {
      const sourceValue = await tree.get(sourceKey);
      const resultKey = await resolvedKeyFn.call(
        scope,
        sourceValue,
        sourceKey,
        tree
      );
      return resultKey;
    }
    const keyFns = cachedKeyFunctions(scopedKeyFn);
    extendedKeyFn = keyFns.key;
    extendedInverseKeyFn = keyFns.inverseKey;
  } else {
    // Use sidecar keyFn/inverseKey functions if the valueFn defines them.
    extendedKeyFn = /** @type {any} */ (valueFn)?.key;
    extendedInverseKeyFn = /** @type {any} */ (valueFn)?.inverseKey;
  }

  const fn = mapFn({
    deep,
    description,
    inverseKey: extendedInverseKeyFn,
    key: extendedKeyFn,
    needsSourceValue,
    value: extendedValueFn,
  });

  return (treelike) => {
    const mapped = fn(treelike);
    const scoped = Scope.treeWithScope(mapped, scope);
    return scoped;
  };
}

/**
 * Given a string specifying an extension or a mapping of one extension to another,
 * return the source and result extensions.
 *
 * Syntax:
 *   foo
 *   foo→bar      Unicode Rightwards Arrow
 *   foo->bar     hyphen and greater-than sign
 *
 * @param {string} specifier
 */
function parseExtensions(specifier) {
  const lowercase = specifier?.toLowerCase() ?? "";
  const extensionRegex =
    /^\.?(?<sourceExtension>\S*)(?:\s*(→|->)\s*)\.?(?<extension>\S+)$/;
  let resultExtension;
  let sourceExtension;
  const match = lowercase.match(extensionRegex);
  if (match?.groups) {
    // foo→bar
    ({ extension: resultExtension, sourceExtension } = match.groups);
  } else {
    // foo
    resultExtension = lowercase;
    sourceExtension = lowercase;
  }
  return { resultExtension, sourceExtension };
}