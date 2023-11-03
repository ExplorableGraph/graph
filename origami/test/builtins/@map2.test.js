import { Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import map2 from "../../src/builtins/@map2.js";

describe("@map2", () => {
  test("gives value and key to both keyFn and valueFn", async () => {
    const treelike = [
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ];
    const fixture = map2({
      keyFn: async (value, key) => value.get("name"),
      valueFn: async (value, key) => value.get("age"),
    })(treelike);
    assert.deepEqual(await Tree.plain(fixture), {
      Alice: 1,
      Bob: 2,
      Carol: 3,
    });
  });
});
