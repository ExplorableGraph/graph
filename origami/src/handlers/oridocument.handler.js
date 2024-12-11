import { ObjectTree, symbols } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import { parseYaml } from "../common/serialize.js";
import { toString } from "../common/utilities.js";
import { processUnpackedContent } from "../internal.js";
import parseFrontMatter from "./parseFrontMatter.js";

/**
 * An Origami template document: a plain text file that contains Origami
 * expressions.
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/language").UnpackFunction} */
  async unpack(packed, options = {}) {
    const parent =
      options.parent ??
      /** @type {any} */ (packed).parent ??
      /** @type {any} */ (packed)[symbols.parent];

    // Unpack as a text document and parse front matter
    const unpacked = toString(packed);
    const parsed = parseFrontMatter(unpacked);

    // Determine the data (if present) and text content
    let text;
    let frontData;
    if (!parsed) {
      text = unpacked;
    } else {
      const { body, frontText, isOrigami } = parsed;
      if (isOrigami) {
        // Origami front matter
        const compiled = compile.expression(frontText.trim());
        frontData = await compiled.call(parent ?? null);
      } else {
        // YAML front matter
        frontData = parseYaml(frontText);
      }
      text = body;
    }

    // See if we can construct a URL to use in error messages
    const sourceName = options.key;
    let url;
    if (sourceName && parent?.url) {
      let parentHref = parent.url.href;
      if (!parentHref.endsWith("/")) {
        parentHref += "/";
      }
      url = new URL(sourceName, parentHref);
    }

    // Construct an object to represent the source code
    const source = {
      text,
      name: options.key,
      url,
    };

    // If input is a document, add the front matter to scope
    let extendedParent;
    if (frontData) {
      extendedParent = new ObjectTree(frontData);
      extendedParent.parent = parent;
    } else {
      extendedParent = parent;
    }

    // Compile the source as an Origami template document
    const templateDefineFn = compile.templateDocument(source);
    const templateFn = await templateDefineFn.call(extendedParent);

    // If the input was a document, return a function that updates
    // the document with the template result as @text. Otherwise
    // return the template result.
    const resultFn = frontData
      ? async (input) => {
          const text = await templateFn(input);
          const result = {
            ...frontData,
            "@text": text,
          };
          result[symbols.parent] = extendedParent;
          return result;
        }
      : templateFn;

    return processUnpackedContent(resultFn, parent);
  },
};
