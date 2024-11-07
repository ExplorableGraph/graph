import { Tree } from "@weborigami/async-tree";
import addNextPrevious from "./addNextPrevious.js";
import cache from "./cache.js";
import calendar from "./calendar.js";
import clean from "./clean.js";
import concat from "./concat.js";
import copy from "./copy.js";
import deepMap from "./deepMap.js";
import deepMerge from "./deepMerge.js";
import deepReverse from "./deepReverse.js";
import deepTake from "./deepTake.js";
import deepValues from "./deepValues.js";
import defineds from "./defineds.js";
import filter from "./filter.js";
import first from "./first.js";
import fromFn from "./fnTree.js";
import globs from "./globs.js";
import group from "./group.js";
import inners from "./inners.js";
import keys from "./keys.js";
import length from "./length.js";
import map from "./map.js";
import match from "./match.js";
import merge from "./merge.js";
import paginate from "./paginate.js";
import parent from "./parent.js";
import plain from "./plain.js";
import reverse from "./reverse.js";
import setDeep from "./setDeep.js";
import shuffle from "./shuffle.js";
import sort from "./sort.js";
import take from "./take.js";
import values from "./values.js";

const commands = {
  ...Tree,
  addNextPrevious,
  cache,
  calendar,
  clean,
  concat,
  copy,
  deepMap,
  deepMerge,
  deepReverse,
  deepTake,
  deepValues,
  defineds,
  filter,
  first,
  fromFn,
  globs,
  group,
  inners,
  keys,
  length,
  map,
  match,
  merge,
  paginate,
  parent,
  plain,
  reverse,
  setDeep,
  shuffle,
  sort,
  take,
  values,
};

Object.defineProperty(commands, "description", {
  enumerable: false,
  value: "Work with trees",
});

export default commands;