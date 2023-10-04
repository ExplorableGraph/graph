/**
 * @typedef {import("../..").JsonValue} JsonValue
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 */

import { Graph } from "@graphorigami/core";
import * as YAMLModule from "yaml";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import expressionTag from "../language/expressionTag.js";
import ExpressionGraph from "./ExpressionGraph.js";
import { isPlainObject } from "./utilities.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

// Return true if the given object has any functions in it.
function objectContainsFunctions(obj) {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "function") {
      return true;
    } else if (isPlainObject(value)) {
      const valueContainsExpression = objectContainsFunctions(value);
      if (valueContainsExpression) {
        return true;
      }
    }
  }
  return false;
}

/**
 * @param {any} obj
 * @returns {obj is JsonValue}
 */
function isJsonValue(obj) {
  const t = typeof obj;
  return (
    t === "boolean" ||
    t === "number" ||
    t === "string" ||
    obj instanceof Date ||
    obj === null
  );
}

/**
 * @param {string} text
 * @returns {JsonValue|AsyncDictionary}
 */
export function parseYaml(text) {
  const data = YAML.parse(text, {
    customTags: [expressionTag],
  });
  if (objectContainsFunctions(data)) {
    return new (FileTreeTransform(ExpressionGraph))(data);
  } else {
    return data;
  }
}

/**
 * Serializes an object as a JSON string.
 *
 * @param {any} obj
 */
export async function toJson(obj) {
  const serializable = await toJsonValue(obj);
  return JSON.stringify(serializable, null, 2);
}

/**
 * Convert the given object to a corresponding JSON value that can be serialized
 * as JSON or YAML.
 *
 * If the object is already a JSON value, it is returned as is.
 *
 * If the object implements the `serialize()` method, that will be invoked and
 * its return value will be processed.
 *
 * If the object is graphable, it will be converted to a plain JavaScript
 * object, recursively traversing the graph and converting all values to native
 * types.
 *
 * @param {any} obj
 * @returns {Promise<JsonValue>}
 */
export async function toJsonValue(obj) {
  if (isJsonValue(obj)) {
    return obj;
  } else if (obj && typeof obj.serialize === "function") {
    obj = await obj.serialize();
  } else if (Graph.isGraphable(obj)) {
    const mapped = Graph.map(obj, (value) => toJsonValue(value));
    return Graph.plain(mapped);
  }

  throw new TypeError("Couldn't serialize object");
}

/**
 * Serializes an object as a JSON string.
 *
 * @param {any} obj
 * @returns {Promise<string>}
 */
export async function toYaml(obj) {
  const serializable = await toJsonValue(obj);
  return YAML.stringify(serializable);
}
