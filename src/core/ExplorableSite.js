import fetch from "./fetch.js";

export default class ExplorableSite {
  #keysPromise;

  constructor(url) {
    this.url = url;
    this.#keysPromise = null;
  }

  async *[Symbol.asyncIterator]() {
    if (!this.#keysPromise) {
      const href = new URL(".keys.json", this.url).href;
      this.#keysPromise = fetch(href);
    }
    const response = await this.#keysPromise;
    const text = await response.text();
    const keys = text ? JSON.parse(text) : [];
    yield* keys;
  }

  async get(...keys) {
    const route = keys.join("/");
    const href = new URL(route, this.url).href;
    if (href.endsWith("/")) {
      // Explorable route
      return new ExplorableSite(href);
    } else {
      // Fetch the data at the given endpoint.
      const response = await fetch(href);
      const buffer = await response.arrayBuffer();
      if (buffer instanceof ArrayBuffer) {
        // Patch the ArrayBuffer to give it more useful toString that decodes
        // the buffer as UTF-8, like Node's Buffer class does.
        buffer.toString = function () {
          return new TextDecoder().decode(this);
        };
      }
      return buffer;
    }
  }
}
