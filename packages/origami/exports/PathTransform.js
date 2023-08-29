import { DictionaryHelpers } from "@graphorigami/core";

const pathKey = Symbol("path");

export default function PathTransform(Base) {
  return class Path extends Base {
    constructor(...args) {
      super(...args);
      // Initialize this[pathKey] to shut up TypeScript.
      this[pathKey] = undefined;
    }

    async get(key) {
      let value = await super.get(key);
      if (DictionaryHelpers.isAsyncDictionary(value)) {
        const path = this[pathKey] ? `${this[pathKey]}/${key}` : key;
        value[pathKey] = path;
      } else if (value === undefined && key === "@path") {
        value = this[pathKey];
      }
      return value;
    }
  };
}