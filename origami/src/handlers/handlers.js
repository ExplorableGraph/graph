import {
  jsHandler,
  oriHandler,
  oridocumentHandler,
  wasmHandler,
  yamlHandler,
} from "../internal.js";
import cssHandler from "./css.handler.js";
import htmHandler from "./htm.handler.js";
import htmlHandler from "./html.handler.js";
import jpegHandler from "./jpeg.handler.js";
import jpgHandler from "./jpg.handler.js";
import jsonHandler from "./json.handler.js";
import mdHandler from "./md.handler.js";
import mjsHandler from "./mjs.handler.js";
import txtHandler from "./txt.handler.js";
import xhtmlHandler from "./xhtml.handler.js";
import ymlHandler from "./yml.handler.js";

export default {
  "css.handler": cssHandler,
  "htm.handler": htmHandler,
  "html.handler": htmlHandler,
  "jpeg.handler": jpegHandler,
  "jpg.handler": jpgHandler,
  "js.handler": jsHandler,
  "json.handler": jsonHandler,
  "md.handler": mdHandler,
  "mjs.handler": mjsHandler,
  "ori.handler": oriHandler,
  "oridocument.handler": oridocumentHandler,
  "txt.handler": txtHandler,
  "wasm.handler": wasmHandler,
  "xhtml.handler": xhtmlHandler,
  "yaml.handler": yamlHandler,
  "yml.handler": ymlHandler,
};
