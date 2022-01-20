export default async function showUsage(commands) {
  console.log(`Usage: pika <expression>, which could be:
- a string like 'Hello' in single quotes
- a file or folder name
- an https: or http: URL
- a name like "foo" that refers to an object/function exported by a local file foo.js
- the name of a built-in function below:
`);

  // Gather usages.
  const usages = [];
  for await (const key of commands) {
    const command = await commands.get(key);
    let usage = command?.usage;
    if (!usage) {
      usage = typeof command === "function" ? defaultUsage(key, command) : key;
    }
    usages.push(usage);
  }

  // Case-insensitive sort
  usages.sort(function (a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  // Split into signatures and descriptions.
  const signatures = [];
  const descriptions = [];
  usages.forEach((usage) => {
    const [signature, description] = usage.split("\t");
    signatures.push(signature);
    descriptions.push(description || "");
  });

  // Calculate length of longest signature.
  const lengths = signatures.map((signature) => signature.length);
  const maxLength = Math.max(...lengths);

  // Format lines, padding the descriptions to that length + gap.
  const gap = 4;
  const length = maxLength + gap;
  const formatted = signatures.map(
    (signature, index) => `${signature.padEnd(length)}${descriptions[index]}`
  );

  console.log(formatted.join("\n"));
  console.log(
    `\nMore details: "pika help"; or get help on a function like serve with "pika help/serve"`
  );
}

function defaultUsage(name, fn) {
  const arity = fn.length;
  if (arity === 0) {
    return `${name}()`;
  } else if (arity === 1) {
    return `${name}(arg)`;
  } else {
    let args = [];
    for (let i = 0; i < arity; i++) {
      args.push(`arg${i + 1}`);
    }
    return `${name}(${args.join(", ")})`;
  }
}
