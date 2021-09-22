import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

export default function PlusKeysMixin(Base) {
  return class PlusKeys extends Base {
    #plusValues;

    async get(key, ...rest) {
      let result = await super.get(key);

      if (!this.#plusValues) {
        this.#plusValues = [];
        for await (const key of this) {
          if (isPlusKey(key)) {
            const value = await super.get(key);
            this.#plusValues.push(value);
          }
        }
      }

      if (
        ExplorableGraph.isExplorable(result) &&
        !isPlusKey(key) &&
        this.#plusValues.length > 0
      ) {
        // Value is explorable; compose it with the plus values.
        result = new Compose(result, ...this.#plusValues);
      }

      result =
        ExplorableGraph.isExplorable(result) && rest.length > 0
          ? await result.get(...rest)
          : result;

      return result;
    }
  };
}

function isPlusKey(key) {
  return key.startsWith("+");
}

async function plusValues(graph) {
  const result = [];
  for await (const key of graph) {
    if (isPlusKey(key)) {
      const value = await graph.get(key);
      result.push(value);
    }
  }
  return result;
}
