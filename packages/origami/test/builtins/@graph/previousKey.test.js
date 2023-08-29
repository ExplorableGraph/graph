import assert from "node:assert";
import { describe, test } from "node:test";
import previousKey from "../../../src/builtins/@graph/previousKey.js";

describe("@graph/previousKey", () => {
  test("gets the previous key in the graph", async () => {
    const graph = {
      a: null,
      b: null,
      c: null,
    };
    assert.equal(await previousKey.call(null, graph, "a"), undefined);
    assert.equal(await previousKey.call(null, graph, "b"), "a");
    assert.equal(await previousKey.call(null, graph, "c"), "b");
  });
});