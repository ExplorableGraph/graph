import ExplorableGraph from "../../core/ExplorableGraph.js";
import MapGraph from "../../core/MapGraph.js";
import files from "./files.js";

export default async function clean(variant) {
  const graph = variant
    ? ExplorableGraph.from(variant)
    : await files.call(this);
  const cleanGraph = await graph.get2(".eg.clean.yaml");
  if (!cleanGraph) {
    // Nothing to clean
    return;
  }
  const undefineds = new MapGraph(cleanGraph, (value) => undefined);
  await graph.set(undefineds);
}

clean.usage = `clean(graph)\tRemoves files created by the make command`;
