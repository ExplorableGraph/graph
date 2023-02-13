import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import loadJson from "../../src/loaders/json.js";
import assert from "../assert.js";

describe(".json loader", () => {
  it("loads input as a JSON file", async () => {
    const text = `{ "a": 1, "b": 2 }`;
    const textWithGraph = await loadJson.call(null, text);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
    });
  });

  it("input that is already a graph variant is returned as is", async () => {
    const input = {
      a: 1,
      b: 2,
    };
    const result = await loadJson.call(null, input);
    assert.equal(result, input);
  });
});