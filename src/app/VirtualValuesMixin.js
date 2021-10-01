import path from "path";
import { pathToFileURL } from "url";

const virtualFileExtension = "=.js";

export default function VirtualValuesMixin(Base) {
  return class VirtualValues extends Base {
    async *[Symbol.asyncIterator]() {
      // For virtual values, return virtual name instead of actual name.
      for await (const key of super[Symbol.asyncIterator]()) {
        yield key.endsWith(virtualFileExtension)
          ? path.basename(key, virtualFileExtension)
          : key;
      }
    }

    async get(key, ...rest) {
      let value = await super.get(key, ...rest);

      if (value !== undefined) {
        // Return existing value as is.
        return value;
      }
      if (key === "." || key === "..") {
        // Special keys "." and ".." can't be used for virtual files.
        return undefined;
      }
      if (rest.length > 0) {
        // Won't be able to fully resolve the rest of the path.
        return undefined;
      }

      // Didn't find the expected value; try a virtual key.
      const virtualKey = `${key}${virtualFileExtension}`;
      // We can't obtain the module via `get`, as the JavaScript module syntax
      // only works directly with file or web paths.
      const modulePath = path.join(this.path, virtualKey);
      // On Windows, absolute paths must be valid file:// URLs.
      const moduleUrl = pathToFileURL(modulePath);
      const obj = await importModule(moduleUrl.href);
      if (obj !== undefined) {
        // Successfully imported module; return its default export.
        value = obj.default;
      }

      return value;
    }
  };

  async function importModule(modulePath) {
    let obj;
    try {
      obj = await import(modulePath);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ERR_MODULE_NOT_FOUND") {
        throw error;
      }
    }
    return obj;
  }
}
