import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

const additions = Symbol("additions");
const childAdditions = Symbol("childAdditions");
const peerAdditions = Symbol("peerAdditions");
const addedPeerAdditions = Symbol("addedPeerAdditions");
const gettingChildAdditions = Symbol("gettingChildAdditions");

export const additionsPrefix = "+";
export const peerAdditionsSuffix = "+";

export default function AdditionsTransform(Base) {
  return class Additions extends Base {
    constructor(...args) {
      super(...args);
      this[childAdditions] = undefined;
      this[peerAdditions] = undefined;
      this[addedPeerAdditions] = undefined;
      this[gettingChildAdditions] = false;
    }

    async additions() {
      if (this[additions] === undefined) {
        if (!this[childAdditions] || !this[peerAdditions]) {
          await this.getKeys();
        }
        const children = this[childAdditions] ?? [];
        const peers = this[peerAdditions] ?? [];
        const allAdditions = [...children, ...peers];
        this[additions] =
          allAdditions.length === 0
            ? null
            : allAdditions.length === 1
            ? allAdditions[0]
            : new Compose(...allAdditions);
      }
      return this[additions];
    }

    async get(key) {
      let value = await super.get(key);
      if (
        value === undefined &&
        !isChildAdditionKey(key) &&
        !this[gettingChildAdditions]
      ) {
        // Not found locally, check additions.
        const additions = await this.additions();
        value = await additions?.get(key);
      }

      // If the value is an explorable graph, add inherited additions.
      if (ExplorableGraph.isExplorable(value)) {
        value[peerAdditions] = await getPeerValues(this, key);
      }

      return value;
    }

    async getKeys() {
      this[childAdditions] = [];
      if (!this[peerAdditions]) {
        this[peerAdditions] = [];
      }
      await super.getKeys();
    }

    async keyAdded(key, existingKeys) {
      await super.keyAdded(key, existingKeys);
      if (isChildAdditionKey(key)) {
        // To avoid an infinite loop, we set a flag to indicate that we're in
        // the process of getting additions. During that process, the get method
        // will be able to get other things, but not additions.
        this[gettingChildAdditions] = true;
        const addition = await this.get(key);
        this[gettingChildAdditions] = false;
        if (addition) {
          const graph = ExplorableGraph.from(addition);
          graph.applyFormulas = false;
          graph.parent = null;
          this[childAdditions].push(graph);
          for await (const graphKey of graph) {
            this.addKey(graphKey);
          }
        }
        // Hide this addition from the public keys.
        return { hidden: true };
      }
      return;
    }

    async keysAdded(keys) {
      await super.keysAdded?.(keys);

      // After the first cycle of keys have been added, add keys from any
      // pending peer additions that were passed down to use from the parent.
      if (!this[addedPeerAdditions]) {
        for (const peerGraph of this[peerAdditions]) {
          for await (const peerKey of peerGraph) {
            this.addKey(peerKey);
          }
        }
        this[addedPeerAdditions] = true;
      }
    }

    // This transform provides a default implentation of the matchAll method,
    // but in typical use the implementation provided by FormulasTransform will
    // be used instead.
    async matchAll(key) {
      const value = await this.get(key);
      return value ? [value] : [];
    }

    // Reset memoized values when the underlying graph changes.
    onChange(key) {
      super.onChange?.(key);
      this[childAdditions] = undefined;
      this[peerAdditions] = undefined;
    }
  };
}

async function getPeerValues(graph, graphKey) {
  const values = [];
  // A peer additions graph itself can't have peer values.
  if (!isPeerAdditionKey(graphKey)) {
    const peerAdditionsKey = `${graphKey}${peerAdditionsSuffix}`;
    const peerAdditions = (await graph.matchAll?.(peerAdditionsKey)) || [];
    peerAdditions.forEach((peerGraph) => {
      peerGraph.applyFormulas = false;
      peerGraph.parent = null;
    });
    values.push(...peerAdditions);
  }
  return values;
}

function isChildAdditionKey(key) {
  return key.startsWith?.(additionsPrefix);
}

function isPeerAdditionKey(key) {
  return key.endsWith?.(peerAdditionsSuffix);
}
