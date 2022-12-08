import mix from "../../src/builtins/mix.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import MetaTransform from "../../src/framework/MetaTransform.js";
import assert from "../assert.js";

describe("mix", () => {
  it("merges graphs", async () => {
    const graph = await mix(
      {
        a: 1,
        b: 2,
      },
      {
        c: 3,
        d: 4,
      }
    );
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });
  });

  it("puts all graphs in scope", async () => {
    const graph = await mix(
      new (MetaTransform(ObjectGraph))({
        a: 1,
        "b = c": null,
      }),
      new (MetaTransform(ObjectGraph))({
        c: 2,
        "d = a": null,
      })
    );
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
      c: 2,
      d: 1,
    });
  });
});
