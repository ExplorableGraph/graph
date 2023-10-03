import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadText from "../../src/loaders/txt.js";

describe("text loader", () => {
  test("loads a document with YAML/JSON front matter", async () => {
    const text = `---
a: 1
---
Body text`;
    const container = new ObjectGraph({});
    const loaded = await loadText(container, text);
    assert.equal(String(loaded), text);
    const document = await loaded.contents();
    assert.equal(document.text, "Body text");
    assert.deepEqual(document.data, { a: 1 });
    assert.equal(document.parent, container);
  });
});
