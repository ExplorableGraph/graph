import assert from "node:assert";
import { describe, test } from "node:test";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";

describe("ExplorableGraph", () => {
  test("entries() returns [key, value] pairs for the graph", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
    });
    const entries = await ExplorableGraph.entries(graph);
    assert.deepEqual(entries, [
      ["a", 1],
      ["b", 2],
    ]);
  });

  test("from() returns an explorable graph as is", async () => {
    const graph1 = new ObjectGraph({
      a: "Hello, a.",
    });
    const graph2 = ExplorableGraph.from(graph1);
    assert.equal(graph2, graph1);
  });

  test("from() uses an object's toGraph() method if defined", async () => {
    const obj = {
      toGraph() {
        return {
          a: "Hello, a.",
        };
      },
    };
    const graph = ExplorableGraph.from(obj);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: "Hello, a.",
    });
  });

  test("isExplorable() tests for explorable graph interface", async () => {
    assert(!ExplorableGraph.isExplorable({}));

    const missingIterator = {
      async get() {},
    };
    assert(!ExplorableGraph.isExplorable(missingIterator));

    const missingGet = {
      async keys() {},
    };
    assert(!ExplorableGraph.isExplorable(missingGet));

    const graph = {
      async get() {},
      async keys() {},
    };
    assert(ExplorableGraph.isExplorable(graph));
  });

  test("isKeyExplorable() indicates whether a key is expected to produce an explorable value", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: {
        c: 2,
      },
    });
    assert(!(await ExplorableGraph.isKeyExplorable(graph, "a")));
    assert(await ExplorableGraph.isKeyExplorable(graph, "b"));
  });

  test("mapReduce() can map values and reduce them", async () => {
    const graph = {
      a: 1,
      b: 2,
      more: {
        c: 3,
      },
      d: 4,
    };
    const reduced = await ExplorableGraph.mapReduce(
      graph,
      (value) => value,
      (values) => String.prototype.concat(...values)
    );
    assert.deepEqual(reduced, "1234");
  });

  test("plain() produces a plain object version of a graph", async () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    };
    const graph = new ObjectGraph(original);
    const plain = await ExplorableGraph.plain(graph);
    assert.deepEqual(plain, original);
  });

  test("plain() produces an array for an array-like graph", async () => {
    const original = ["a", "b", "c"];
    const graph = new ObjectGraph(original);
    const plain = await ExplorableGraph.plain(graph);
    assert.deepEqual(plain, original);
  });

  test("plain() leaves an array-like graph as an object if keys aren't consecutive", async () => {
    const original = {
      0: "a",
      1: "b",
      // missing
      3: "c",
    };
    const graph = new ObjectGraph(original);
    const plain = await ExplorableGraph.plain(graph);
    assert.deepEqual(plain, original);
  });

  test("fromJson() can parse JSON text", async () => {
    const yaml = `{"a": 1, "b": 2, "c": 3}`;
    const graph = ExplorableGraph.fromJson(yaml);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
      c: 3,
    });
  });

  test("fromYaml() can parse YAML text", async () => {
    const yaml = `a: Hello, a.
b: Hello, b.
c: Hello, c.`;
    const graph = ExplorableGraph.fromYaml(yaml);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
  });

  test("toFunction() returns the graph in function form", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
    });
    const fn = ExplorableGraph.toFunction(graph);
    assert.equal(await fn("a"), 1);
  });

  test("toJson() renders a graph as JSON", async () => {
    const graph = new ObjectGraph({ a: "Hello, a." });
    const json = await ExplorableGraph.toJson(graph);
    assert.equal(json, `{\n  "a": "Hello, a."\n}`);
  });

  test("toYaml() renders a graph as YAML", async () => {
    const graph = new ObjectGraph({ a: "Hello, a." });
    const yaml = await ExplorableGraph.toYaml(graph);
    assert.equal(yaml, `a: Hello, a.\n`);
  });

  test("traverse() a path of keys", async () => {
    const obj = new ObjectGraph({
      a1: 1,
      a2: {
        b1: 2,
        b2: {
          c1: 3,
          c2: 4,
        },
      },
    });
    assert.equal(await ExplorableGraph.traverse(obj), obj);
    assert.equal(await ExplorableGraph.traverse(obj, "a1"), 1);
    assert.equal(await ExplorableGraph.traverse(obj, "a2", "b2", "c2"), 4);
    assert.equal(
      await ExplorableGraph.traverse(obj, "a2", "doesntexist", "c2"),
      undefined
    );
  });

  test("traverse() from one explorable into another", async () => {
    const obj = new ObjectGraph({
      a1: {
        a2: new ObjectGraph({
          b1: {
            b2: 1,
          },
        }),
      },
    });
    assert.equal(
      await ExplorableGraph.traverse(obj, "a1", "a2", "b1", "b2"),
      1
    );
  });

  test("values() returns an iterator for the graph's values", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.deepEqual(Array.from(await graph.keys()), ["a", "b", "c"]);
  });
});
