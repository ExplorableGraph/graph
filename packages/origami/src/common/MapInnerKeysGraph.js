import { DictionaryHelpers, GraphHelpers } from "@graphorigami/core";

export default class MapInnerKeysGraph {
  constructor(variant, keyFn, options = {}) {
    this.graph = GraphHelpers.from(variant);
    this.keyFn = keyFn;
    this.deep = options.deep ?? false;
    this.mapInnerKeyToOuterKey = new Map();
    this.mapOuterKeyToInnerKey = new Map();
    this.options = options;
  }
  async get(outerKey) {
    const innerKey = await this.innerKeyForOuterKey(outerKey);
    let value =
      innerKey === undefined ? undefined : await this.graph.get(innerKey);

    // If the value to return is an explorable graph, wrap it with a map.
    if (this.deep && DictionaryHelpers.isAsyncDictionary(value)) {
      value = Reflect.construct(this.constructor, [
        value,
        this.keyFn,
        this.options,
      ]);
    }

    return value;
  }

  // This is expensive, as we have to loop through all the keys in the inner
  // graph, get values, and map the value and inner key to an outer key. We
  // cache the result, so this is only done once per outer key.
  async innerKeyForOuterKey(outerKey) {
    if (!this.mapOuterKeyToInnerKey.has(outerKey)) {
      // We will also memoize a mapping of an outer key to undefined.
      let innerKey = undefined;
      for (const key of await this.graph.keys()) {
        const mappedKey = await this.outerKeyForInnerKey(key);
        if (mappedKey === outerKey) {
          innerKey = key;
          break;
        }
      }
      this.mapOuterKeyToInnerKey.set(outerKey, innerKey);
    }
    return this.mapOuterKeyToInnerKey.get(outerKey);
  }

  async keys() {
    const keys = new Set();
    for (const innerKey of await this.graph.keys()) {
      const outerKey = await this.outerKeyForInnerKey(innerKey);
      if (outerKey !== undefined) {
        keys.add(outerKey);
      }
    }
    return keys;
  }

  onChange(key) {
    this.mapInnerKeyToOuterKey.clear();
    this.mapOuterKeyToInnerKey.clear();
  }

  async outerKeyForInnerKey(innerKey) {
    if (!this.mapInnerKeyToOuterKey.has(innerKey)) {
      const value = await this.graph.get(innerKey);
      const outerKey =
        value !== undefined && this.keyFn
          ? await this.keyFn.call(this, value, innerKey)
          : value;
      this.mapOuterKeyToInnerKey.set(outerKey, innerKey);
      this.mapInnerKeyToOuterKey.set(innerKey, outerKey);
    }
    return this.mapInnerKeyToOuterKey.get(innerKey);
  }

  async unwatch() {
    return /** @type {any} */ (this.graph).unwatch?.();
  }
  async watch() {
    await /** @type {any} */ (this.graph).watch?.();
  }
}