import { ExplorableMap } from "@explorablegraph/exfn";
import chai from "chai";
import { argumentMarker, default as execute } from "../src/execute.js";
const { assert } = chai;

describe.skip("execute", () => {
  it("can execute, passing an argument all the way down to an inner function", () => {
    function greet(name) {
      return `Hello ${name}`;
    }
    const map = new Map([[greet, argumentMarker]]);
    const exfn = new ExplorableMap(map);
    const result = execute(exfn, "world");
    assert.equal(result, "Hello world");
  });
});
