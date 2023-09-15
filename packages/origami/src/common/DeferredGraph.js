import { Graph, ObjectGraph } from "@graphorigami/core";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import Scope from "./Scope.js";
import {
  getScope,
  isTransformApplied,
  keySymbol,
  transformObject,
} from "./utilities.js";

/**
 * A graph that is loaded lazily.
 *
 * This is useful in situations like a toGraph() function, which is expected to
 * return a graph synchronously. If constructing the graph requires an
 * asynchronous operation, this class can be used as a wrapper that can be
 * returned immediately. When the graph's keys or get functions are called, the
 * graph will be loaded as necessary.
 */
export default class DeferredGraph {
  constructor(loadFn) {
    this.deferredParent = null;
    this.graph = null;
    this.loadFn = loadFn;
    this.loadPromise = null;
    this.loadResult = null;
  }

  async get(key) {
    await this.load();

    // The default value of a deferred graph is the result of the load function,
    // which may or may not be a graph. (E.g., for a JavaScript module, the
    // result of the load function is the module's default export, which may
    // happen to be some other type of JavaScript object.)
    return key === Graph.defaultValueKey
      ? this.loadResult
      : this.graph.get(key);
  }

  async keys() {
    await this.load();
    return this.graph.keys();
  }

  async load() {
    // We use a promise to ensure that the load function is only invoked once.
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Invoke the load function, casting the result to a promise if it isn't
    // one. Arrange to process and save the result once it's loaded.
    this.loadPromise = Promise.resolve(this.loadFn()).then((result) => {
      this.loadResult = result;

      // If the load result is a graph, use it as is. Otherwise, construct an
      // empty graph. In both cases, the graph's default value is the load
      // result.
      let graph = Graph.isGraphable(result)
        ? Graph.from(result)
        : new ObjectGraph({});

      if (this.deferredParent) {
        if (!isTransformApplied(InheritScopeTransform, graph)) {
          graph = transformObject(InheritScopeTransform, graph);
        }
        /** @type {any} */ (graph).parent = this.deferredParent;
        this.deferredParent = null;
      }

      this.graph = graph;
      if (!this[keySymbol]) {
        this[keySymbol] = graph[keySymbol];
      }
    });

    return this.loadPromise;
  }

  get parent() {
    return this.deferredParent ?? /** @type {any} */ (this.graph)?.parent;
  }
  set parent(parent) {
    if (!this.graph) {
      // Not ready to set the parent yet.
      this.deferredParent = parent;
    } else {
      // Avoid destructive modification of the underlying graph.
      this.graph = Object.create(this.graph);
      /** @type {any} */ (this.graph).parent = parent;
    }
  }

  get scope() {
    return this.parent ? new Scope(this, getScope(this.parent)) : this;
  }
}
