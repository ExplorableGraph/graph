import { outputWithGraph } from "../core/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import loadOrigamiTemplate from "../loaders/ori.js";

/**
 * Concatenate the text content of objects or graphs.
 *
 * @this {Explorable}
 * @param {StringLike} input
 * @param {boolean} [emitFrontMatter]
 */
export default async function inline(input, emitFrontMatter) {
  assertScopeIsDefined(this);
  const inputText = String(input);
  const template = await loadOrigamiTemplate(inputText);
  const templateResult = await template.apply(input, this);
  const result = emitFrontMatter
    ? await outputWithGraph(
        templateResult,
        /** @type {any} */ (template).toGraph?.(),
        emitFrontMatter
      )
    : templateResult;
  return result;
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/cli/builtins.html#@inline";