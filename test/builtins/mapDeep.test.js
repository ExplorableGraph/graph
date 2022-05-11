import mapDeep from "../../src/builtins/mapDeep.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("map", () => {
  it("maps all the values in a graph", async () => {
    /** @type {any} */
    const fixture = mapDeep(
      {
        a: "Hello, a.",
        b: "Hello, b.",
        c: "Hello, c.",
      },
      (value) => value.toUpperCase()
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: "HELLO, A.",
      b: "HELLO, B.",
      c: "HELLO, C.",
    });
  });

  it("applies a mapping function to convert designated file extensions", async () => {
    /** @type {any} */
    const fixture = mapDeep(
      {
        "file1.txt": "will be mapped",
        file2: "won't be mapped",
        "file3.foo": "won't be mapped",
      },
      (value) => value.toUpperCase(),
      ".txt",
      ".upper"
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
  });

  it("mapping function context has @key and dot ambient properties", async () => {
    /** @type {any} */
    const results = mapDeep(
      ["a", "b", "c"],
      /** @this {any} */
      async function () {
        const key = await this.get("@key");
        const value = await this.get(".");
        return { key, value };
      }
    );
    assert.deepEqual(await ExplorableGraph.plain(results), [
      { key: "0", value: "a" },
      { key: "1", value: "b" },
      { key: "2", value: "c" },
    ]);
  });
});
