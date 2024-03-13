import processUnpackedContent from "../../common/processUnpackedContent.js";

/**
 * A JavaScript file
 *
 * Unpacking a JavaScript file returns its default export, or its set of exports
 * if there is more than one.
 */
export default {
  mediaType: "application/javascript",

  /** @type {import("@weborigami/language").FileUnpackFunction} */
  async unpack(input, options = {}) {
    const { key, parent } = options;
    if (parent && "import" in parent) {
      const content = await /** @type {any} */ (parent).import?.(key);
      return processUnpackedContent(content, parent);
    }
  },
};
