import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("ExplorableGraph", () => {
  it("isExplorable tests for explorable graph interface", async () => {
    assert(!ExplorableGraph.isExplorable({}));

    const missingIterator = {
      async get() {},
    };
    assert(!ExplorableGraph.isExplorable(missingIterator));

    const missingGet = {
      async *[Symbol.asyncIterator]() {},
    };
    assert(!ExplorableGraph.isExplorable(missingGet));

    const graph = {
      async *[Symbol.asyncIterator]() {},
      async get() {},
    };
    assert(ExplorableGraph.isExplorable(graph));
  });

  it("keys returns an array of the graph's keys", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.deepEqual(await ExplorableGraph.keys(graph), ["a", "b", "c"]);
  });

  it("mapValues() applies a mapping function to values", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const strings = await ExplorableGraph.mapValues(graph, (value) =>
      String(value)
    );
    assert.deepEqual(strings, {
      a: "1",
      b: "2",
      c: "3",
      more: {
        d: "4",
        e: "5",
      },
    });
  });

  it("map returns a new explorable applying a mapping function", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const doubled = ExplorableGraph.map(graph, (value) => 2 * value);
    const plain = await ExplorableGraph.plain(doubled);
    assert.deepEqual(plain, {
      a: 2,
      b: 4,
      c: 6,
      more: {
        d: 8,
        e: 10,
      },
    });
  });

  it("plain() produces a plain object version of a graph", async () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    };
    const graph = new ExplorableObject(original);
    const plain = await ExplorableGraph.plain(graph);
    assert.deepEqual(plain, original);
  });
});
