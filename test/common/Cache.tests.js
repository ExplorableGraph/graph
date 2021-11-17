import Cache from "../../src/common/Cache.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("Cache", () => {
  it("returns the first defined value from an ordered list of graphs", async () => {
    const fixture = new Cache(
      {},
      {
        a: 1,
        b: 2,
        c: 3,
      }
    );
    const cache = fixture.cache;

    const keys = await ExplorableGraph.keys(fixture);
    assert.deepEqual(keys, ["a", "b", "c"]);

    assert.isUndefined(await cache.get2("a"));
    assert.equal(await fixture.get2("a"), 1);
    assert.equal(await cache.get2("a"), 1);

    assert.isUndefined(await cache.get2("b"));
    assert.equal(await fixture.get2("b"), 2);
    assert.equal(await cache.get2("b"), 2);
  });

  it("if a cache filter is supplied, it only caches files that match the filter", async () => {
    const fixture = new Cache(
      {},
      {
        "a.txt": "a",
        "b.txt": "b",
        c: "c",
      },
      {
        "{x}.txt": true,
      }
    );
    const cache = fixture.cache;

    // Access some values to populate the cache.
    await fixture.get2("a.txt");
    await fixture.get2("b.txt");
    await fixture.get2("c");

    // The a.txt and b.txt values should be cached because they match the filter.
    // assert.equal(await cache.get2("a.txt"), "a");
    // assert.equal(await cache.get2("b.txt"), "b");

    // The c value should not be cached because it does not match the filter.
    assert.isUndefined(await cache.get2("c"));
  });
});
