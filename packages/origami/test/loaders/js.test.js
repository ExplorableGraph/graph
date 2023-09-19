import { FilesGraph, Graph } from "@graphorigami/core";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import ImportModulesMixin from "../../src/common/ImportModulesMixin.js";
import loadJs from "../../src/loaders/js.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const fixturesGraph = new (ImportModulesMixin(FilesGraph))(fixturesDirectory);

describe(".js loader", () => {
  test("loads .js file that exports a string", async () => {
    const buffer = await fixturesGraph.get("string.js");
    const stringFile = await loadJs.call(fixturesGraph, buffer, "string.js");
    const stringGraph = stringFile.toGraph();
    const string = await stringGraph.get(Graph.defaultValueKey);
    assert.equal(string, "This is a string.");
  });

  test("loads .js file that exports a function", async () => {
    const buffer = await fixturesGraph.get("greet.js");
    const greetFile = await loadJs.call(fixturesGraph, buffer, "greet.js");
    const greetGraph = greetFile.toGraph();
    const greet = await greetGraph.get(Graph.defaultValueKey);
    assert.equal(await greet("world"), "Hello, world!");
  });

  test("loads .js file that exports an object", async () => {
    const buffer = await fixturesGraph.get("obj.js");
    const greetFile = await loadJs.call(fixturesGraph, buffer, "obj.js");
    assert.deepEqual(await Graph.plain(greetFile), { a: 1 });
  });
});
