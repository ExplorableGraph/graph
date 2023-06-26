import { AsyncGraph } from "@graphorigami/types";
import { GraphVariant, PlainObject } from "..";
import DictionaryHelpers from "./DictionaryHelpers";

export default class GraphHelpers extends DictionaryHelpers {
  static assign(target: GraphVariant, source: GraphVariant): Promise<AsyncGraph>;
  static from(graph: GraphVariant): AsyncGraph;
  static isGraphable(obj: any): boolean;
  static isKeyForSubgraph(graph: AsyncGraph, obj: any): Promise<boolean>;
  static keysFromPath(path: string): string[];
  static map(graph: GraphVariant, mapFn: (any) => any): Promise<AsyncGraph>;
  static mapReduce(graph: GraphVariant, mapFn: null|((any) => any|null), reduceFn: (any) => any): Promise<any>;
  static plain(graph: GraphVariant): Promise<PlainObject>;
  static toFunction(graph: GraphVariant): Function;
  static traverse(graph: GraphVariant, ...keys: any[]): Promise<any>;
  static traverseOrThrow(graph: GraphVariant, ...keys: any[]): Promise<any>;
  static traversePath(graph: GraphVariant, path: string): Promise<any>;
}