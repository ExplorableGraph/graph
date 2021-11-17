import FormulasMixin from "../../src/app/FormulasMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

class FormulasObject extends FormulasMixin(ExplorableObject) {}

describe("FormulasMixin", () => {
  it("can get a value defined by a variable pattern", async () => {
    const fixture = new FormulasObject({
      "{x}.txt": "Default text",
      "a.txt": "Specific text",
    });
    assert.equal(await fixture.get2("a.txt"), "Specific text");
    assert.equal(await fixture.get2("b.txt"), "Default text");
  });

  it("matches extensions", async () => {
    const fixture = new FormulasObject({
      "{x}.html": "html",
      "{y}": "no extension",
    });
    assert.equal(await fixture.get2("foo.html"), "html");
    assert.equal(await fixture.get2("bar.baz.html"), "html");
    assert.equal(await fixture.get2("foo.json"), undefined); // Has extension
    assert.equal(await fixture.get2("foo"), "no extension");
  });

  it("can compute keys for variable patterns", async () => {
    const fixture = new FormulasObject({
      "{x}.json": "html",
      a: "",
      b: "",
    });
    assert.deepEqual(await ExplorableGraph.keys(fixture), [
      "a",
      "a.json",
      "b",
      "b.json",
      "{x}.json",
    ]);
  });

  it("can compute keys for assignments", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.deepEqual(await ExplorableGraph.keys(fixture), ["a", "a = b", "b"]);
  });

  it("can get a value defined by an assignment", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.equal(await fixture.get2("a"), "Hello");
  });

  it("first formula that returns a defined value is used", async () => {
    const fixture = new FormulasObject({
      a: undefined,
      "a = b()": "",
      "a = c": "",
      b: () => undefined,
      c: "Hello",
    });
    assert.equal(await fixture.get2("a"), "Hello");
  });

  it("can define assignments to variables", async () => {
    const fixture = new FormulasObject({
      "{name} = 'FOO'": "",
    });
    assert.equal(await fixture.get2("alice"), "FOO");
    assert.equal(await fixture.get2("bob"), "FOO");
  });

  it("can pass variable name to right-hand side", async () => {
    const fixture = new FormulasObject({
      "{name} = `Hello, ${name}.`": "",
    });
    assert.deepEqual(await fixture.get2("Alice"), "Hello, Alice.");
    assert.deepEqual(await fixture.get2("Bob"), "Hello, Bob.");
  });

  it("can pass bindings to subgraphs", async () => {
    const fixture = new FormulasObject({
      "{x}": {
        "{y} = `${x}${y}`": "",
      },
    });
    assert.equal(
      await ExplorableGraph.traverse(fixture, "foo", "bar"),
      "foobar"
    );
    assert.equal(
      await ExplorableGraph.traverse(fixture, "fizz", "buzz"),
      "fizzbuzz"
    );
  });
});
