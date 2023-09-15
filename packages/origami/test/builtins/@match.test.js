/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import match from "../../src/builtins/@match.js";

describe("match", () => {
  test("matches keys against a simplified pattern", async () => {
    /** @this {AsyncDictionary|null} */
    async function fn() {
      const name = await this?.get("name");
      return `Hello, ${name}!`;
    }
    const graph = match.call(null, "[name].html", fn, [
      "Alice.html",
      "Bob.html",
      "Carol.html",
    ]);
    assert.deepEqual(await Graph.plain(graph), {
      "Alice.html": "Hello, Alice!",
      "Bob.html": "Hello, Bob!",
      "Carol.html": "Hello, Carol!",
    });
    const value = await graph.get("David.html");
    assert.equal(value, "Hello, David!");
  });

  test("matches keys against a regular expression", async () => {
    /** @this {AsyncDictionary|null} */
    async function fn() {
      const name = await this?.get("name");
      return `Hello, ${name}!`;
    }
    const graph = match.call(null, /^(?<name>.+)\.html$/, fn);
    const value = await graph.get("Alice.html");
    assert.equal(value, "Hello, Alice!");
  });
});
