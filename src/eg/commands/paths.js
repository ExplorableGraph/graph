import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function paths(variant = this.graph, prefix = "") {
  const graph = ExplorableGraph.from(variant);
  const result = [];
  for await (const key of graph) {
    const valuePath = prefix ? `${prefix}/${key}` : key;
    const value = await graph.get2(key);
    result.push(valuePath);
    if (ExplorableGraph.isExplorable(value)) {
      const subPaths = await paths(value, valuePath);
      result.push(...subPaths);
    }
  }
  return result;
}

paths.usage = `paths(graph)\tReturn an array of paths to the values in the graph`;
