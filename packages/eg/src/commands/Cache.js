import { Cache } from "../../../core/exports.js";

export default async function cache(...args) {
  return new Cache(...args);
}

cache.usage = `Cache(cache, ...graphs)\tCaches graph values in a storable cache`;
