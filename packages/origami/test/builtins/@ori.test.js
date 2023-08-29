import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import builtins from "../../src/builtins/@builtins.js";
import ori from "../../src/builtins/@ori.js";
import Scope from "../../src/common/Scope.js";
describe("ori builtin", () => {
  test("evaluates an expression in the context of a scope and returns result", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
    });
    const scope = new Scope(
      {
        "@current": graph,
      },
      graph,
      builtins
    );
    const result = await ori.call(scope, `@graph/keys`);
    assert.equal(
      String(result),
      `- a
- b
- c
`
    );
  });
});