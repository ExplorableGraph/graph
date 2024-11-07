import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import { builtins } from "../../src/builtins/internal.js";
import ori from "../../src/origami/ori.js";

describe("ori builtin", () => {
  test("evaluates an expression in the context of a tree and returns result", async () => {
    const tree = new ObjectTree({
      a: 1,
      b: 2,
      c: 3,
    });
    tree.parent = new ObjectTree(builtins);
    const result = await ori.call(tree, `@keys`);
    assert.equal(
      String(result),
      `- a
- b
- c
`
    );
  });
});