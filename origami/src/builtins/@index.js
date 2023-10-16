import { Tree } from "@graphorigami/core";
import TextDocument from "../common/TextDocument.js";
import { keySymbol } from "../common/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Return a default index.html page for the current tree.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 */
export default async function index(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);
  const keys = Array.from(await tree.keys());

  // Skip system-ish files that start with a period. Also skip `index.html`.
  const filtered = keys.filter(
    (key) => !(key.startsWith?.(".") || key === "index.html")
  );

  const links = [];
  for (const key of filtered) {
    const keyText = String(key);
    // Simple key.
    const link = `<li><a href="${keyText}">${keyText}</a></li>`;
    links.push(link);
  }

  const heading = tree[keySymbol] ?? "Index";
  const list = `
    <h1>${heading.trim()}</h1>
    <ul>\n${links.join("\n").trim()}\n</ul>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          li {
            margin-bottom: 0.20em;
          }

          a {
            text-decoration: none;
          }
          a:hover {
            text-decoration: revert;
          }
        </style>
      </head>
      <body>
        ${list.trim()}
      </body>
    </html>`;

  return new TextDocument(html.trim(), tree);
}

index.usage = `@index\tReturn a default index.html page for the current tree`;
index.documentation = "https://graphorigami.org/language/@index.html";
