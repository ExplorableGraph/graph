import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import set from "../../../src/builtins/@frontMatter/set.js";

describe("@frontMatter/set", () => {
  test("attaches data to text", async () => {
    /** @type {any} */
    const fixture = set("Hello, world!", { foo: "bar" });
    assert.equal(String(fixture), "Hello, world!");
    const graph = await fixture.unpack();
    assert.deepEqual(await Graph.plain(graph), { foo: "bar" });
  });
});
