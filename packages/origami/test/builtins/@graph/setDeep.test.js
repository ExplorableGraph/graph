import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import setDeep from "../../../src/builtins/@graph/setDeep.js";
describe("@graph/setDeep", () => {
  test("can apply updates with a single argument to set", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      more: {
        d: 3,
      },
    });

    // Apply changes.
    await setDeep(graph, {
      a: 4, // Overwrite existing value
      b: undefined, // Delete
      c: 5, // Add
      more: {
        // Should leave existing `more` keys alone.
        e: 6, // Add
      },
      // Add new explorable value
      extra: {
        f: 7,
      },
    });

    assert.deepEqual(await GraphHelpers.plain(graph), {
      a: 4,
      c: 5,
      more: {
        d: 3,
        e: 6,
      },
      extra: {
        f: 7,
      },
    });
  });

  test("can apply updates to an array", async () => {
    const graph = new ObjectGraph(["a", "b", "c"]);
    await setDeep(graph, ["d", "e"]);
    assert.deepEqual(await GraphHelpers.plain(graph), ["d", "e", "c"]);
  });
});