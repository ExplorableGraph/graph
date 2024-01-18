import { DeepObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import map from "../../src/builtins/@map.js";

describe("@map", () => {
  test("puts value and key in scope", async () => {
    const treelike = [
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ];
    const fixture = map({
      /** @this {import("@weborigami/types").AsyncTree} */
      keyMap: async function (sourceValue, sourceKey, tree) {
        const keyInScope = await this.get("@key");
        assert.equal(keyInScope, sourceKey);
        const valueInScope = await this.get("_");
        assert.equal(valueInScope, sourceValue);
        return valueInScope.name;
      },
      valueMap: (sourceValue, sourceKey, tree) => sourceValue.age,
    })(treelike);
    assert.deepEqual(await Tree.plain(fixture), {
      Alice: 1,
      Bob: 2,
      Carol: 3,
    });
  });

  test("can change a key's extension", async () => {
    const treelike = {
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    };
    const transform = map({
      extensions: "txt->upper",
      valueMap: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const fixture = transform(treelike);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });

  test("can bind the @key and value (_) to different names", async () => {
    const treelike = {
      a: 1,
      b: 2,
    };
    const transform = map({
      /** @this {import("@weborigami/types").AsyncTree} */
      keyMap: async function (sourceValue, sourceKey, tree) {
        const letter = await this.get("letter");
        const value = await this.get("number");
        return `${letter}${value}`;
      },
      keyName: "letter",
      valueName: "number",
    });
    const fixture = transform(treelike);
    assert.deepEqual(await Tree.plain(fixture), {
      a1: 1,
      b2: 2,
    });
  });

  test("can map keys and values deeply", async () => {
    const treelike = new DeepObjectTree({
      a: 1,
      more: {
        b: 2,
      },
    });
    const transform = map({
      deep: true,
      keyMap: (sourceValue, sourceKey, tree) => `${sourceKey}${sourceValue}`,
      valueMap: (sourceValue, sourceKey, tree) => 2 * sourceValue,
    });
    const mapped = transform(treelike);
    assert.deepEqual(await Tree.plain(mapped), {
      a1: 2,
      more: {
        b2: 4,
      },
    });
  });

  test("can take a treelike source and return the transformed tree", async () => {
    const treelike = new DeepObjectTree({
      a: 1,
      more: {
        b: 2,
      },
    });
    const mapped = map(treelike, {
      deep: true,
      keyMap: (sourceValue, sourceKey, tree) => `${sourceKey}${sourceValue}`,
      // @ts-ignore until we can figure out why @satisfies doesn't fix this type error
      valueMap: (sourceValue, sourceKey, tree) => 2 * sourceValue,
    });
    assert.deepEqual(await Tree.plain(mapped), {
      a1: 2,
      more: {
        b2: 4,
      },
    });
  });

  test("can map extensions deeply", async () => {
    const treelike = new DeepObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
      more: {
        "file4.txt": "will be mapped",
        "file5.bar": "won't be mapped",
      },
    });
    const transform = map({
      deep: true,
      extensions: "txt->upper",
      valueMap: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const fixture = transform(treelike);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      more: {
        "file4.upper": "WILL BE MAPPED",
      },
    });
  });
});
