async function fetchWrapper(resource, options) {
  const response = await fetch(resource, options);
  return response.ok ? await response.arrayBuffer() : undefined;
}

const commands = {
  Array,
  Boolean,
  Date,
  Error,
  Infinity,
  Intl,
  JSON,
  Map,
  Math,
  NaN,
  Number,
  Object,
  RegExp,
  Set,
  String,
  Symbol,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  false: false,
  fetch: fetchWrapper,
  isFinite,
  isNaN,
  null: null,
  parseFloat,
  parseInt,
  true: true,
  undefined: undefined,
};

Object.defineProperty(commands, "description", {
  enumerable: false,
  value: "JavaScript classes and functions",
});

export default commands;