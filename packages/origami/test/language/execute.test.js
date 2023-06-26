import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import execute from "../../src/language/execute.js";
import * as ops from "../../src/language/ops.js";

describe("execute", () => {
  test("can retrieve values from scope", async () => {
    const code = [ops.scope, "message"];
    const scope = {
      message: "Hello",
    };
    const result = await execute.call(scope, code);
    assert.equal(result, "Hello");
  });

  test("can invoke functions in scope", async () => {
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

  test("passes context to invoked functions", async () => {
    const code = [ops.scope, "fn"];
    const scope = {
      async fn() {
        assert.equal(this, context);
      },
    };
    await execute.call(scope, code);
  });
});
