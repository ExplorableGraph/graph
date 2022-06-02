import * as fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("ExplorableFiles", () => {
  it("Can return the set of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new ExplorableFiles(directory);
    assert.deepEqual(await ExplorableGraph.keys(files), [
      "a.txt",
      "b.txt",
      "c.txt",
      "more",
    ]);
    const more = await files.get("more");
    assert.deepEqual(await ExplorableGraph.keys(more), ["d.txt", "e.txt"]);
  });

  it("Can return the contents of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new ExplorableFiles(directory);
    const plain = await ExplorableGraph.toSerializable(files);
    assert.deepEqual(plain, {
      "a.txt": "The letter A",
      "b.txt": "The letter B",
      "c.txt": "The letter C",
      more: {
        "d.txt": "The letter D",
        "e.txt": "The letter E",
      },
    });
  });

  it("Can retrieve a file", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new ExplorableFiles(directory);
    const file = await files.get("a.txt");
    assert.equal(String(file), "The letter A");
  });

  it("Can traverse a path of keys in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new ExplorableFiles(directory);
    const file = await ExplorableGraph.traverse(files, "more", "e.txt");
    assert.equal(String(file), "The letter E");
  });

  it("can write out a file via set()", async () => {
    await createTempDirectory();

    // Write out a file.
    const fileName = "file1";
    const fileText = "This is the first file.";
    const tempFiles = new ExplorableFiles(tempDirectory);
    await tempFiles.set(fileName, fileText);

    // Read it back in.
    const filePath = path.join(tempDirectory, fileName);
    const actualText = String(await fs.readFile(filePath));

    assert.equal(fileText, actualText);

    await removeTempDirectory();
  });

  it("can write out multiple files via set()", async () => {
    await createTempDirectory();

    // Create a tiny set of "files".
    const obj = {
      file1: "This is the first file.",
      subfolder: {
        file2: "This is the second file.",
      },
    };
    const files = new ObjectGraph(obj);

    // Write out files.
    const tempFiles = new ExplorableFiles(tempDirectory);
    await tempFiles.set(files);

    // Read them back in.
    const actualFiles = new ExplorableFiles(tempDirectory);
    const actualStrings = await ExplorableGraph.toSerializable(actualFiles);
    assert.deepEqual(actualStrings, obj);

    await removeTempDirectory();
  });

  it("can delete a file via set()", async () => {
    await createTempDirectory();
    const tempFile = path.join(tempDirectory, "file");
    await fs.writeFile(tempFile, "");
    const tempFiles = new ExplorableFiles(tempDirectory);
    await tempFiles.set("file", undefined);
    let stats;
    try {
      stats = await fs.stat(tempFile);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert.isUndefined(stats);
    await removeTempDirectory();
  });

  it("can delete a folder via set()", async () => {
    await createTempDirectory();
    const folder = path.join(tempDirectory, "folder");
    await fs.mkdir(folder);
    const tempFiles = new ExplorableFiles(tempDirectory);
    await tempFiles.set("folder", undefined);
    let stats;
    try {
      stats = await fs.stat(folder);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert.isUndefined(stats);
    await removeTempDirectory();
  });

  it("can indicate which values are explorable", async () => {
    const graph = new ExplorableFiles(fixturesDirectory);
    const keys = await ExplorableGraph.keys(graph);
    const valuesExplorable = await Promise.all(
      keys.map(async (key) => await graph.isKeyExplorable(key))
    );
    assert.deepEqual(valuesExplorable, [true, false, false]);
  });
});

async function createTempDirectory() {
  await fs.mkdir(tempDirectory, { recursive: true });
}

async function removeTempDirectory() {
  await fs.rm(tempDirectory, { recursive: true });
}
