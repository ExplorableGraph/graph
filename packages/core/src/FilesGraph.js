import * as fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isTypedArray } from "node:util/types";
import * as Graph from "./Graph.js";

// Names of OS-generated files that should not be enumerated
const hiddenFileNames = {
  ".DS_Store": true,
};

// Used for natural sort order
const collator = new Intl.Collator(undefined, {
  numeric: true,
});

/**
 * A file system tree as a graph of Buffers.
 *
 * @typedef {import("@graphorigami/types").AsyncMutableGraph} AsyncMutableGraph
 * @implements {AsyncMutableGraph}
 */
export default class FilesGraph {
  /**
   * @param {string} location
   */
  constructor(location) {
    this.dirname = location.startsWith("file://")
      ? path.dirname(fileURLToPath(location))
      : path.resolve(process.cwd(), location);
  }

  async get(key) {
    // The graph's default value is the graph itself.
    if (key === Graph.defaultValueKey) {
      return this;
    }

    const filePath = path.resolve(this.dirname, key);

    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (/** @type {any} */ error) {
      if (error.code === "ENOENT" /* File not found */) {
        return undefined;
      }
      throw error;
    }

    return stats.isDirectory()
      ? Reflect.construct(this.constructor, [filePath]) // Return subdirectory as a graph
      : fs.readFile(filePath); // Return file contents
  }

  async isKeyForSubgraph(key) {
    const filePath = path.join(this.dirname, key);
    const stats = await stat(filePath);
    return stats ? stats.isDirectory() : false;
  }

  /**
   * Enumerate the names of the files/subdirectories in this directory.
   */
  async keys() {
    let entries;
    try {
      entries = await fs.readdir(this.dirname, { withFileTypes: true });
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      entries = [];
    }

    let names = entries.map((entry) => entry.name);

    // Filter out unhelpful file names.
    names = names.filter((name) => !hiddenFileNames[name]);

    // Node fs.readdir sort order appears to be unreliable; see, e.g.,
    // https://github.com/nodejs/node/issues/3232. That seems unhelpful for many
    // applications. Since it's quite common for file names to include numbers,
    // we use natural sort order: ["file1", "file9", "file10"] instead of
    // ["file1", "file10", "file9"].
    names.sort(collator.compare);
    return names;
  }

  get path() {
    return this.dirname;
  }

  async set(key, value) {
    // Where are we going to write this value?
    const stringKey = key ? String(key) : "";
    const destPath = path.resolve(this.dirname, stringKey);

    // Treat null value as empty string; will create an empty file.
    if (value === null) {
      value = "";
    }

    // Write an ArrayBuffer value as a Buffer.
    if (value instanceof ArrayBuffer) {
      value = Buffer.from(value);
    }

    // True if fs.writeFile can directly write the value to a file.
    const writeable =
      typeof value === "string" ||
      value instanceof String ||
      value instanceof Buffer ||
      value instanceof DataView ||
      (globalThis.ReadableStream && value instanceof ReadableStream) ||
      isTypedArray(value);

    if (value === undefined) {
      // Delete the file or directory.
      let stats;
      try {
        stats = await stat(destPath);
      } catch (/** @type {any} */ error) {
        if (error.code === "ENOENT" /* File not found */) {
          return this;
        }
        throw error;
      }
      if (stats?.isDirectory()) {
        // Delete directory.
        await fs.rm(destPath, { recursive: true });
      } else if (stats) {
        // Delete file.
        await fs.unlink(destPath);
      }
    } else if (!writeable && Graph.isGraphable(value)) {
      // Treat value as a graph and write it out as a subdirectory.
      const destGraph = Reflect.construct(this.constructor, [destPath]);
      await Graph.assign(destGraph, value);
    } else {
      // Ensure this directory exists.
      await fs.mkdir(this.dirname, { recursive: true });

      if (!writeable) {
        if (typeof value.toString === "function") {
          value = value.toString();
        } else {
          const typeName = value?.constructor?.name ?? "unknown";
          throw new TypeError(
            `Cannot write a value of type ${typeName} as ${stringKey}`
          );
        }
      }

      // Write out the value as the contents of a file.
      await fs.writeFile(destPath, value);
    }

    return this;
  }
}

// Return the file information for the file/folder at the given path.
// If it does not exist, return undefined.
async function stat(filePath) {
  try {
    // Await the result here so that, if the file doesn't exist, the catch block
    // below will catch the exception.
    return await fs.stat(filePath);
  } catch (/** @type {any} */ error) {
    if (error.code === "ENOENT" /* File not found */) {
      return undefined;
    }
    throw error;
  }
}
