import path from "path";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import DefaultPages from "../framework/DefaultPages.js";
import MetaTransform from "../framework/MetaTransform.js";
import config from "./config.js";

/**
 * Wrap a graph in an explorable app.
 *
 * @param {Explorable} variant
 */
export default async function graphApp(variant) {
  const graph = ExplorableGraph.from(variant);
  const meta = transformObject(MetaTransform, graph);
  const scopePath =
    /** @type {any} */ (graph).path ?? path.resolve(process.cwd());
  meta.parent = await config(scopePath);
  const result = new DefaultPages(meta);
  return result;
}

graphApp.usage = `graphApp <graph>\tCreate an app by wrapping a graph`;
graphApp.documentation =
  "https://explorablegraph.org/pika/builtins.html#graphApp";
