#!/usr/bin/env node

import { JavaScriptModuleFiles } from "@explorablegraph/node";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

// Load a graph of our own commands.
const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(dirname, "cli-commands");
const commandFiles = new JavaScriptModuleFiles(commandsPath);

async function invoke(command, ...args) {
  const commandFilename = `${command}.js`;
  const commandFn = command
    ? await commandFiles.get(commandFilename)
    : undefined;
  if (!commandFn) {
    await showUsage();
    return;
  }
  await commandFn(...args);
}

async function showUsage() {
  for await (const commandFilename of commandFiles) {
    const commandFn = await commandFiles.get(commandFilename);
    console.log(commandFn.usage);
  }
}

// Process command line arguments
const args = process.argv;
args.shift(); // "node"
args.shift(); // name of this script file
// Not sure why we end up with blank arguments; skip them.
while (args[0] === "") {
  args.shift();
}
await invoke(...args);
