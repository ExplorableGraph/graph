import { Tree } from "../internal.js";
import * as trailingSlash from "../trailingSlash.js";

/**
 * A tree whose keys are strings interpreted as regular expressions.
 *
 * Requests to `get` a key are matched against the regular expressions, and the
 * value for the first matching key is returned. The regular expresions are
 * taken to match the entire key -- if they do not already start and end with
 * `^` and `$` respectively, those are added.
 *
 * @type {import("../../index.ts").TreeTransform}
 */
export default async function regExpKeys(treelike) {
  if (!treelike) {
    const error = new TypeError(
      `regExpKeys: The tree of regular expressions isn't defined.`
    );
    /** @type {any} */ (error).position = 0;
    throw error;
  }

  const tree = Tree.from(treelike);
  const map = new Map();

  // We build the output tree first so that we can refer to it when setting
  // `parent` on subtrees below.
  let result = {
    // @ts-ignore
    description: "regExpKeys",

    async get(key) {
      if (key == null) {
        // Reject nullish key.
        throw new ReferenceError(
          `${this.constructor.name}: Cannot get a null or undefined key.`
        );
      }

      for (const [regExp, value] of map) {
        if (regExp.test(key)) {
          return value;
        }
      }
      return undefined;
    },

    async keys() {
      return map.keys();
    },
  };

  // Turn the input tree's string keys into regular expressions, then map those
  // to the corresponding values.
  for (const key of await tree.keys()) {
    if (typeof key !== "string") {
      // Skip non-string keys.
      continue;
    }

    // Get value.
    let value = await tree.get(key);

    let regExp;
    if (trailingSlash.has(key) || Tree.isAsyncTree(value)) {
      const baseKey = trailingSlash.remove(key);
      regExp = new RegExp("^" + baseKey + "/?$");
      // Subtree
      value = regExpKeys(value);
      if (!value.parent) {
        value.parent = result;
      }
    } else {
      // Construct regular expression.
      let text = key;
      if (!text.startsWith("^")) {
        text = "^" + text;
      }
      if (!text.endsWith("$")) {
        text = text + "$";
      }
      regExp = new RegExp(text);
    }
    map.set(regExp, value);
  }

  return result;
}