import ExplorableGraph from "../core/ExplorableGraph.js";

export const ghostGraphExtension = "+";

export default function GhostValuesMixin(Base) {
  return class GhostValues extends Base {
    constructor(...args) {
      super(...args);
      this.ghostGraphs = [];
    }

    async *[Symbol.asyncIterator]() {
      yield* super[Symbol.asyncIterator]();
      for (const graph of this.ghostGraphs) {
        yield* graph;
      }
    }

    async get(key) {
      // Try local graph first.
      let value = await super.get(key);
      if (value === undefined) {
        // Wasn't found in local graph, try ghost graphs.
        for (const graph of this.ghostGraphs) {
          value = await graph.get(key);
          if (value !== undefined) {
            break;
          }
        }
      } else if (ExplorableGraph.isExplorable(value) && !isGhostKey(key)) {
        // Add ghost graphs from local formulas.
        const ghostKey = `${key}${ghostGraphExtension}`;
        value.ghostGraphs = await this.localFormulaMatches(ghostKey);
      }
      return value;
    }
  };
}

function isGhostKey(key) {
  return key.endsWith(ghostGraphExtension);
}
