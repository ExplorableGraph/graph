import ObjectGraph from "../../src/core/ObjectGraph.js";
import execute from "../../src/language/execute.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

describe("execute", () => {
  it("can retrieve values from scope", async () => {
    const code = [ops.scope, "message"];
    const scope = {
      message: "Hello",
    };
    const result = await execute.call(scope, code);
    assert.equal(result, "Hello");
  });

  it("can invoke functions in scope", async () => {
    // Match the array representation of code generated by the parser.
    const code = [
      [ops.scope, "greet"],
      [ops.scope, "name"],
    ];

    const scope = new ObjectGraph({
      async greet(name) {
        return `Hello ${name}`;
      },
      name: "world",
    });

    const result = await execute.call(scope, code);
    assert.equal(result, "Hello world");
  });

  it("passes context to invoked functions", async () => {
    const code = [ops.scope, "fn"];
    const scope = {
      async fn() {
        assert.equal(this, context);
      },
    };
    await execute.call(scope, code);
  });
});
