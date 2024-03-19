import { Tree, isPlainObject } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import document from "../common/document.js";
import { toString } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import fileTypeOrigami from "./ori_handler.js";
import fileTypeText from "./txt_handler.js";

/**
 * Inline any Origami expressions found inside ${...} placeholders in the input
 * text.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertScopeIsDefined(this, "inline");

  // Get the input text and any attached front matter.
  let inputDocument;
  if (input["@text"]) {
    inputDocument = input;
  } else if (/** @type {any} */ (input).unpack) {
    // Have the input unpack itself.
    inputDocument = await /** @type {any} */ (input).unpack();
  } else {
    // Unpack the input as a text document with possible front matter.
    const text = toString(input);
    if (text) {
      inputDocument = await fileTypeText.unpack(text);
    } else {
      throw new TypeError(
        "Input to @inline must be something that can be treated as text."
      );
    }
  }

  // If the input document is a plain object or AsyncTree, we'll have it
  // included in scope for the evaluated expression. We ignore other kinds of
  // treelike inputs for this test: in particular, a Buffer will be interpreted
  // as a tree, but we don't want to put a Buffer in scope.
  const attachedData =
    isPlainObject(inputDocument) || Tree.isAsyncTree(inputDocument)
      ? inputDocument
      : null;

  const templateFn = await fileTypeOrigami.unpack(inputDocument, {
    attachedData,
    compiler: compile.templateDocument,
  });
  const templateResult = await templateFn(inputDocument);
  return inputDocument
    ? document(templateResult, inputDocument)
    : templateResult;
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://weborigami.org/language/@inline.html";
