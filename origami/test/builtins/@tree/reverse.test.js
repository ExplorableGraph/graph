import { Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import reverse from "../../../src/builtins/@tree/reverse.js";

describe("@tree/reverse", () => {
  test("reverses a tree's top-level keys", async () => {
    const tree = {
      a: "A",
      b: "B",
      c: "C",
    };
    const reversed = await reverse.call(null, tree);
    // @ts-ignore
    assert.deepEqual(Array.from(await reversed.keys()), ["c", "b", "a"]);
    // @ts-ignore
    assert.deepEqual(await Tree.plain(reversed), {
      c: "C",
      b: "B",
      a: "A",
    });
  });
});
