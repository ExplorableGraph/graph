import * as calc from "../calc/calc.js";
import * as dev from "../dev/dev.js";
import * as handlers from "../handlers/handlers.js";
import * as image from "../image/image.js";
import * as origami from "../origami/origami.js";
import * as site from "../site/site.js";
import * as text from "../text/text.js";
import * as tree from "../tree/tree.js";
import deprecated from "./deprecated.js";
import explore from "./explore.js";
import files from "./files.js";
import help from "./help.js";
import http from "./http.js";
import https from "./https.js";
import inherited from "./inherited.js";
import js from "./js.js";
import instantiate from "./new.js";
import node from "./node.js";
import packageNamespace from "./package.js";
import treehttp from "./treehttp.js";
import treehttps from "./treehttps.js";

/** @type {any} */
export default {
  "calc:": adjustReservedWords(calc),
  "dev:": dev,
  "explore:": explore,
  "files:": files,
  "help:": help,
  "http:": http,
  "https:": https,
  "image:": image,
  "inherited:": inherited,
  "js:": js,
  "new:": instantiate,
  "node:": node,
  "origami:": origami,
  "package:": packageNamespace,
  "site:": adjustReservedWords(site),
  "text:": text,
  "tree:": tree,
  "treehttp:": treehttp,
  "treehttps:": treehttps,

  // Some builtins need to be exposed at top level
  ...handlers.default,

  // Deprecated builtins
  ...deprecated,
};

// Handle cases where a builtin name conflicts with a JS reserved word
function adjustReservedWords(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const name = value.key ?? key;
    result[name] = value;
  }
  return result;
}
