import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import createMapTransform from "../../src/transforms/createMapTransform.js";

describe("createMapTransform", () => {
  test("returns identity graph if no keyFn or valueFn", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
      more: {
        c: "letter c",
      },
    });
    const mapped = createMapTransform({})(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "letter a",
      b: "letter b",
      more: {
        c: "letter c",
      },
    });
  });

  test("maps values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
      more: {
        c: "letter c",
      },
    });
    const uppercaseValues = createMapTransform({
      valueFn: (value) => value.toUpperCase(),
    });
    const mapped = uppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "LETTER A",
      b: "LETTER B",
      more: {
        c: "LETTER C",
      },
    });
  });

  test("maps keys", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
      more: {
        c: "letter c",
      },
    });
    const uppercaseKeys = createMapTransform({
      keyFn: async (key) => key.toUpperCase(),
    });
    const mapped = uppercaseKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "letter a",
      B: "letter b",
      MORE: {
        C: "letter c",
      },
    });
  });

  test("maps keys using keyFn and innerKeyFn", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
      more: {
        c: "letter c",
      },
    });
    const uppercaseKeys = createMapTransform({
      keyFn: async (key) => key.toUpperCase(),
      innerKeyFn: async (key) => key.toLowerCase(),
    });
    const mapped = uppercaseKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "letter a",
      B: "letter b",
      MORE: {
        C: "letter c",
      },
    });
  });

  test("maps keys and values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
      more: {
        c: "letter c",
      },
    });
    const uppercaseKeysValues = createMapTransform({
      keyFn: (key) => key.toUpperCase(),
      valueFn: async (value) => value.toUpperCase(),
    });
    const mapped = uppercaseKeysValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "LETTER A",
      B: "LETTER B",
      MORE: {
        C: "LETTER C",
      },
    });
  });
});