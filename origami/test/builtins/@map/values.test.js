import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import map from "../../../src/builtins/@map/values.js";

describe("map", () => {
  test("maps all the values in a graph", async () => {
    /** @type {any} */
    const fixture = map.call(
      null,
      {
        a: "Hello, a.",
        b: "Hello, b.",
        c: "Hello, c.",
      },
      (value) => value.toUpperCase()
    );
    assert.deepEqual(await Graph.plain(fixture), {
      a: "HELLO, A.",
      b: "HELLO, B.",
      c: "HELLO, C.",
    });
  });

  test("maps subobjects as values by default", async () => {
    /** @type {any} */
    const fixture = map.call(
      null,
      {
        english: {
          a: "Hello, a.",
        },
        french: {
          a: "Bonjour, a.",
        },
      },
      async (value) => JSON.stringify(await Graph.plain(value))
    );
    assert.deepEqual(await Graph.plain(fixture), {
      english: '{"a":"Hello, a."}',
      french: '{"a":"Bonjour, a."}',
    });
  });

  test("setting deep option maps subobjects deeply", async () => {
    /** @type {any} */
    const fixture = map.call(
      null,
      {
        english: {
          a: "Hello, a.",
        },
        french: {
          a: "Bonjour, a.",
        },
      },
      (value) => value.toUpperCase(),
      { deep: true }
    );
    assert.deepEqual(await Graph.plain(fixture), {
      english: {
        a: "HELLO, A.",
      },
      french: {
        a: "BONJOUR, A.",
      },
    });
  });

  test("mapping function context includes the value's graph", async () => {
    /** @type {any} */
    const results = map.call(
      null,
      [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
      /** @this {any} */
      async function () {
        const name = await this.get("name");
        return name;
      },
      { addValueToScope: true }
    );
    assert.deepEqual(await Graph.plain(results), ["Alice", "Bob", "Carol"]);
  });

  test("extended map function includes @key and _", async () => {
    /** @type {any} */
    const results = map.call(
      null,
      { a: 1, b: 2, c: 3 },
      /** @this {any} */
      async function () {
        const key = await this.get("@key");
        const value = await this.get("_");
        return `${key}: ${value}`;
      }
    );
    assert.deepEqual(await Graph.plain(results), {
      a: "a: 1",
      b: "b: 2",
      c: "c: 3",
    });
  });

  test("can specify how @key should be added to scope", async () => {
    /** @type {any} */
    const results = map.call(
      null,
      { a: 1, b: 2, c: 3 },
      /** @this {any} */
      async function () {
        return this.get("thing");
      },
      { keyName: "thing" }
    );
    assert.deepEqual(await Graph.plain(results), {
      a: "a",
      b: "b",
      c: "c",
    });
  });

  test("can map to a constant value", async () => {
    /** @type {any} */
    const results = map.call(null, { a: 1, b: 2, c: 3 }, () => "constant");
    assert.deepEqual(await Graph.plain(results), {
      a: "constant",
      b: "constant",
      c: "constant",
    });
  });
});