import DefaultValues from "../common/DefaultValuesTransform.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";

export default function DefaultPagesTransform(Base) {
  return class DefaultPages extends DefaultValues(Base) {
    constructor(...args) {
      super(...args);
      Object.assign(this.defaults, {
        ".keys.json": defaultKeysJson,
        "index.html": defaultIndexHtml,
      });
    }
  };
}