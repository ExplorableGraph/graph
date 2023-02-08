import * as YAMLModule from "yaml";
import FunctionGraph from "./FunctionGraph.js";
import MapValuesGraph from "./MapValuesGraph.js";
import ObjectGraph from "./ObjectGraph.js";
import * as utilities from "./utilities.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * A collection of static methods providing helpers for working with explorable
 * graphs.
 */
export default class ExplorableGraph {
  /**
   * Returns true if the indicated object can be cast to an explorable graph.
   *
   * @param {any} obj
   */
  static canCastToExplorable(obj) {
    return (
      this.isExplorable(obj) ||
      obj instanceof Function ||
      obj instanceof Array ||
      obj?.toFunction instanceof Function ||
      obj?.toGraph instanceof Function ||
      utilities.isPlainObject(obj)
    );
  }

  /**
   * Attempts to cast the indicated graph variant to an explorable graph.
   *
   * @param {GraphVariant} variant
   * @returns {Explorable}
   */
  static from(variant) {
    // Use the object's toGraph() method if defined.
    let obj = variant;
    while (typeof (/** @type {any} */ (obj).toGraph) === "function") {
      obj = /** @type {any} */ (obj).toGraph();
    }

    if (this.isExplorable(obj)) {
      // Object itself supports the ExplorableGraph interface.
      // @ts-ignore
      return obj;
    }

    // Handle known types.
    if (obj instanceof Function) {
      return new FunctionGraph(obj);
    } else if (obj instanceof Array || utilities.isPlainObject(obj)) {
      // @ts-ignore
      return new ObjectGraph(obj);
    } else if (typeof (/** @type {any} */ (obj).toFunction) === "function") {
      const fn = /** @type {any} */ (obj).toFunction();
      return new FunctionGraph(fn);
    }

    throw new TypeError("Couldn't convert object to an explorable graph");
  }

  /**
   * Parse the given object as JSON text and return the corresponding explorable
   * graph.
   *
   * Empty text will be treated as an empty object.
   *
   * @param {any} obj
   */
  static fromJson(obj) {
    let parsed = JSON.parse(obj);
    if (parsed === null) {
      // String was empty or just YAML comments.
      parsed = {};
    }
    return new ObjectGraph(parsed);
  }

  /**
   * Parse the given object as YAML text and return the corresponding explorable
   * graph.
   *
   * Empty text (or text with just comments) will be treated as an empty object.
   *
   * @param {any} obj
   */
  static fromYaml(obj) {
    let parsed = utilities.parse(String(obj));
    if (parsed === null) {
      // String was empty or just YAML comments.
      parsed = {};
    }
    return new ObjectGraph(parsed);
  }

  /**
   * Return true if the given object implements the necessary explorable graph
   * members: a function identified with `Symbol.asyncIterator`, and a function
   * named `get`.
   *
   * @param {any} obj
   */
  static isExplorable(obj) {
    return (
      obj != null &&
      typeof obj[Symbol.asyncIterator] === "function" &&
      typeof obj.get === "function"
    );
  }

  /**
   * Return true if the indicated key produces or is expected to produce an
   * explorable value.
   *
   * This defers to the graph's own isKeyExplorable method. If not found, this
   * gets the value of that key and returns true if the value is in fact
   * explorable.
   */
  // REVIEW: The name of this suggests that it examines whether the key itself
  // is explorable, but really it's the value that matters. Calling this
  // `isValueExplorable`, on the other hand, makes it sound like it takes a
  // value argument instead of a key.
  static async isKeyExplorable(graph, key) {
    if (graph.isKeyExplorable) {
      return graph.isKeyExplorable(key);
    }
    const value = await graph.get(key);
    return this.isExplorable(value);
  }

  /**
   * Returns the graph's keys as an array.
   *
   * @param {GraphVariant} variant
   */
  static async keys(variant) {
    const graph = this.from(variant);
    const result = [];
    for await (const key of graph) {
      result.push(key);
    }
    return result;
  }

  /**
   * Map and reduce a graph.
   *
   * This is done in as parallel fashion as possible. Each of the graph's values
   * will be requested in an async call, then those results will be awaited
   * collectively. If a mapFn is provided, it will be invoked to convert each
   * value to a mapped value; otherwise, values will be used as is. When the
   * values have been obtained, all the values and keys will be passed to the
   * reduceFn, which should consolidate those into a single result.
   *
   * @param {GraphVariant} variant
   * @param {Function|null} mapFn
   * @param {Function} reduceFn
   */
  static async mapReduce(variant, mapFn, reduceFn) {
    const graph = this.from(variant);

    // We're going to fire off all the get requests in parallel, as quickly as
    // the keys come in.
    const keys = [];
    const promises = [];
    for await (const key of graph) {
      keys.push(key);

      // Call the graph's `get` method, but *don't* wait for it yet.
      const promise = graph.get(key).then((value) =>
        // If the value is itself a graph, recurse.
        this.isExplorable(value)
          ? this.mapReduce(value, mapFn, reduceFn)
          : mapFn
          ? mapFn(value, key)
          : value
      );
      promises.push(promise);
    }

    // Wait for all the promises to resolve. Because the promises were captured
    // in the same order as the keys, the values will also be in the same order.
    const values = await Promise.all(promises);

    // Reduce the values to a single result.
    return reduceFn(values, keys);
  }

  /**
   * Converts an asynchronous explorable graph into a synchronous plain
   * JavaScript object.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to a plain object.
   *
   * @param {GraphVariant} variant
   * @returns {Promise<PlainObject|Array>}
   */
  static async plain(variant) {
    return this.mapReduce(variant, null, (values, keys) => {
      const obj = {};
      for (let i = 0; i < keys.length; i++) {
        obj[keys[i]] = values[i];
      }
      const result = castArrayLike(obj);
      return result;
    });
  }

  /**
   * Returns the graph in function form.
   *
   * @param {GraphVariant} variant
   * @returns {Function}
   */
  static toFunction(variant) {
    const graph = this.from(variant);
    return graph.get.bind(graph);
  }

  /**
   * Returns the graph as a JSON string.
   *
   * @param {GraphVariant} variant
   */
  static async toJson(variant) {
    const serializable = await this.toSerializable(variant);
    const cast = castArrayLike(serializable);
    return JSON.stringify(cast, null, 2);
  }

  /**
   * Converts the graph into a plain JavaScript object with the same structure
   * as the graph, but which can be serialized to text. All keys will be cast to
   * strings, and all values reduced to native JavaScript types as best as
   * possible.
   *
   * @param {GraphVariant} variant
   */
  static async toSerializable(variant) {
    const serializable = new MapValuesGraph(variant, utilities.toSerializable, {
      deep: true,
    });
    return this.plain(serializable);
  }

  /**
   * Returns the graph as a YAML string.
   *
   * @param {GraphVariant} variant
   * @returns {Promise<string>}
   */
  static async toYaml(variant) {
    const serializable = await this.toSerializable(variant);
    const cast = castArrayLike(serializable);
    return YAML.stringify(cast);
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * @param {GraphVariant} variant
   * @param {...any} keys
   */
  static async traverse(variant, ...keys) {
    try {
      // Await the result here so that, if the file doesn't exist, the catch
      // block below will catch the exception.
      return await this.traverseOrThrow(variant, ...keys);
    } catch (/** @type {any} */ error) {
      if (error instanceof TraverseError) {
        return undefined;
      } else {
        throw error;
      }
    }
  }

  /**
   * Return the value at the corresponding path of keys. Throw if any interior
   * step of the path doesn't lead to a result.
   *
   * @param {GraphVariant} variant
   * @param  {...any} keys
   */
  static async traverseOrThrow(variant, ...keys) {
    // Start our traversal at the root of the graph.
    let value = variant;

    // Process each key in turn.
    // If the value is ever undefined, short-circuit the traversal.
    const remainingKeys = keys.slice();
    while (remainingKeys.length > 0) {
      if (value === undefined) {
        throw new TraverseError(
          `Couldn't traverse the path: ${keys.join("/")}`,
          value,
          keys
        );
      }

      // If the value isn't already explorable, cast it to an explorable graph.
      // If someone is trying to call `get` on this thing, they mean to treat it
      // as an explorable graph.
      const graph = ExplorableGraph.from(value);

      // If the graph supports the traverse() method, pass the remaining keys
      // all at once.
      if (graph.traverse) {
        value = await graph.traverse(...remainingKeys);
        break;
      }

      // Otherwise, process the next key.
      const key = remainingKeys.shift();
      value = await graph.get(key);
    }
    return value;
  }

  /**
   * Returns the graph's values as an array.
   *
   * @param {GraphVariant} variant
   */
  static async values(variant) {
    const graph = this.from(variant);
    const result = [];
    for await (const key of graph) {
      result.push(await graph.get(key));
    }
    return result;
  }
}

// If the given plain object has only integer keys, return it as an array.
// Otherwise return it as is.
function castArrayLike(obj) {
  let hasKeys = false;
  let expectedIndex = 0;
  for (const key in obj) {
    hasKeys = true;
    const index = Number(key);
    if (isNaN(index) || index !== expectedIndex) {
      // Not an array-like object.
      return obj;
    }
    expectedIndex++;
  }
  return hasKeys ? Object.values(obj) : obj;
}

class TraverseError extends ReferenceError {
  constructor(message, graph, keys) {
    super(message);
    this.graph = graph;
    this.name = "TraverseError";
    this.keys = keys;
  }
}
