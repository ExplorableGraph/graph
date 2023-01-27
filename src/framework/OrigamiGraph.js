import FileLoadersTransform from "../common/FileLoadersTransform.js";
import execute from "../language/execute.js";
import * as ops from "../language/ops.js";
import { objectDefinitions } from "../language/parse.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import PathTransform from "./PathTransform.js";

class OrigamiGraphBase {
  constructor(definitions) {
    // If the definition is text parse it, otherwise use as is.
    if (typeof definitions === "string") {
      const parsed = objectDefinitions(definitions);
      const code = parsed?.value;
      if (!parsed || parsed.rest !== "" || code?.[0] !== ops.object) {
        console.error(`could not parse as an Origami graph: ${definitions}`);
        return;
      }
      definitions = code[1];
    }

    // Separate the parsed simple properties from the formulas.
    this.properties = {};
    this.formulas = {};
    for (const [key, value] of Object.entries(definitions)) {
      if (value instanceof Array) {
        this.formulas[key] = value;
      } else {
        this.properties[key] = value;
      }
    }
  }

  async *[Symbol.asyncIterator]() {
    yield* Object.keys(this.properties);
    yield* Object.keys(this.formulas);
  }

  async get(key) {
    if (key === undefined) {
      // Getting undefined returns the graph itself.
      return this;
    }

    // Try properties first.
    let value = this.properties[key];
    if (value !== undefined) {
      return value;
    }

    // Then try formulas.
    const formula = this.formulas[key];
    if (formula) {
      const scope = this.scope ?? this;
      value = await execute.call(scope, formula);
    }
    return value;
  }
}

const OrigamiGraph = PathTransform(
  InheritScopeTransform(FileLoadersTransform(OrigamiGraphBase))
);

export default OrigamiGraph;
