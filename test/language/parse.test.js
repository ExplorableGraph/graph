import * as ops from "../../src/language/ops.js";
import {
  args,
  assignment,
  expression,
  functionComposition,
  getReference,
  group,
  key,
  lambda,
  list,
  literal,
  number,
  object,
  objectProperty,
  optionalWhitespace,
  percentCall,
  percentPath,
  protocolCall,
  singleQuoteString,
  slashCall,
  slashPath,
  spacePathCall,
  spaceUrl,
  substitution,
  templateDocument,
  templateLiteral,
  thisReference,
  urlProtocolCall,
} from "../../src/language/parse.js";
import assert from "../assert.js";

describe.only("parse", () => {
  it("args", () => {
    assertParse(args(" a, b, c"), [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse(args("(a, b, c)"), [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse(args("()"), []);
    assert.equal(args(""), null);
  });

  it("assignment", () => {
    assertParse(assignment("foo = fn 'bar'"), [
      "=",
      "foo",
      [[ops.scope, "fn"], "bar"],
    ]);
    assertParse(assignment("data = obj.json"), [
      "=",
      "data",
      [ops.scope, "obj.json"],
    ]);
    assertParse(assignment("match = .. .. .. foo bar"), [
      "=",
      "match",
      [ops.scope, "..", "..", "..", "foo", "bar"],
    ]);
  });

  it("assignment with `this` on right-hand side", () => {
    assertParse(assignment("foo = this.json"), [
      "=",
      "foo",
      [ops.scope, [ops.thisKey]],
    ]);
    assertParse(assignment("foo = this().js"), [
      "=",
      "foo",
      [[ops.scope, [ops.thisKey]]],
    ]);
    assertParse(assignment("foo = this('bar').js"), [
      "=",
      "foo",
      [[ops.scope, [ops.thisKey]], "bar"],
    ]);
  });

  it("assignment with extension on right-hand side", () => {
    assertParse(assignment("foo.html = .ori"), [
      "=",
      "foo.html",
      [[ops.scope, [ops.thisKey]]],
    ]);
  });

  it("expression", () => {
    assertParse(expression("obj.json"), [ops.scope, "obj.json"]);
    assertParse(expression("(fn a, b, c)"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse(expression("foo.bar( 'hello' , 'world' )"), [
      [ops.scope, "foo.bar"],
      "hello",
      "world",
    ]);
    assertParse(expression("(fn)('a')"), [[ops.scope, "fn"], "a"]);
    assertParse(expression("1"), 1);
    assert.equal(expression("(foo"), null);
    assertParse(expression("a:1 b:2"), [ops.object, { a: 1, b: 2 }]);
    assertParse(expression("serve index.html:'hello'"), [
      [ops.scope, "serve"],
      [ops.object, { "index.html": "hello" }],
    ]);
  });

  it("expression with function with space-separated arguments, mixed argument types", () => {
    assertParse(expression(`copy app(formulas), files 'snapshot'`), [
      [ops.scope, "copy"],
      [
        [ops.scope, "app"],
        [ops.scope, "formulas"],
      ],
      [[ops.scope, "files"], "snapshot"],
    ]);
  });

  it("functionComposition", () => {
    assertParse(functionComposition("fn()"), [[ops.scope, "fn"]]);
    assertParse(functionComposition("fn('arg')"), [[ops.scope, "fn"], "arg"]);
    assertParse(functionComposition("fn('a', 'b')"), [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assertParse(functionComposition("fn 'a', 'b'"), [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assertParse(functionComposition("fn a, b"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    // A call with implicit parentheses can't span newlines.
    assertParse(functionComposition("fn\na, b"), null);
    assertParse(functionComposition("fn a(b), c"), [
      [ops.scope, "fn"],
      [
        [ops.scope, "a"],
        [ops.scope, "b"],
      ],
      [ops.scope, "c"],
    ]);
    assertParse(functionComposition("fn1 fn2 'arg'"), [
      [ops.scope, "fn1"],
      [[ops.scope, "fn2"], "arg"],
    ]);
    assertParse(functionComposition("fn a, b, c:1"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.object, { c: 1 }],
    ]);
  });

  it("functionComposition indirect", () => {
    assertParse(functionComposition("(fn()) 'arg'"), [
      [[ops.scope, "fn"]],
      "arg",
    ]);
    assertParse(functionComposition("(fn()) (a, b)"), [
      [[ops.scope, "fn"]],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse(functionComposition("fn('a')('b')"), [
      [[ops.scope, "fn"], "a"],
      "b",
    ]);
    assert.equal(functionComposition("(fn())"), null);
  });

  it("getReference", () => {
    assertParse(getReference("hello"), [ops.scope, "hello"]);
  });

  it("group", () => {
    assertParse(group(" ( hello )"), [ops.scope, "hello"]);
    assertParse(group("(((nested)))"), [ops.scope, "nested"]);
    assertParse(group("(fn())"), [[ops.scope, "fn"]]);
    assert.equal(group("("), null);
  });

  it("key", () => {
    assertParse(key("foo"), "foo");
  });

  it("key marked as inheritable", () => {
    assertParse(key("…index.html = foo()"), [
      "=",
      "index.html",
      [[ops.scope, "foo"]],
    ]);
    assertParse(key("…a"), ["=", "a", [ops.scope, [ops.thisKey]]]);
  });

  it("lambda", () => {
    assertParse(lambda("= message"), [ops.lambda, [ops.scope, "message"]]);
    assertParse(lambda("=`Hello, {{name}}.`"), [
      ops.lambda,
      [ops.concat, "Hello, ", [ops.scope, "name"], "."],
    ]);
  });

  it("list", () => {
    assert.equal(list(""), null);
    assertParse(list(" a"), [[ops.scope, "a"]]);
    assertParse(list(" a , b,c, d , e"), [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
      [ops.scope, "d"],
      [ops.scope, "e"],
    ]);
    assertParse(list(`'foo', 'bar'`), ["foo", "bar"]);
    assertParse(list("a(b), c"), [
      [
        [ops.scope, "a"],
        [ops.scope, "b"],
      ],
      [ops.scope, "c"],
    ]);
  });

  it("literalReference", () => {
    assert.deepEqual(literal("hello"), {
      value: "hello",
      rest: "",
    });
    assert.equal(literal(""), null);
    assert.equal(literal("()"), null);
  });

  it("number", () => {
    assertParse(number("1"), 1);
    assertParse(number("3.14159"), 3.14159);
    assertParse(number("-1"), -1);
  });

  it.only("object", () => {
    assertParse(object("{a:1 b:2}"), [ops.object, { a: 1, b: 2 }]);
    assertParse(object("{ x = fn('a') }"), [
      ops.object,
      {
        x: [[ops.scope, "fn"], "a"],
      },
    ]);
    assertParse(object("{ a:1 \n x=fn('a') }"), [
      ops.object,
      {
        a: 1,
        x: [[ops.scope, "fn"], "a"],
      },
    ]);
  });

  it("objectProperty", () => {
    assertParse(objectProperty("a: 1"), { a: 1 });
    assertParse(objectProperty("name:'Alice'"), { name: "Alice" });
    assertParse(objectProperty("x : fn('a')"), { x: [[ops.scope, "fn"], "a"] });
  });

  it("percentCall", () => {
    assertParse(percentCall("graph%"), [ops.scope, "graph", undefined]);
    assertParse(percentCall("graph%foo%bar"), [
      ops.scope,
      "graph",
      "foo",
      "bar",
    ]);
  });

  it("percentPath", () => {
    assertParse(percentPath("foo%bar%baz"), ["foo", "bar", "baz"]);
    assertParse(percentPath("foo%bar%baz%"), ["foo", "bar", "baz", undefined]);
  });

  it("protocolCall", () => {
    assertParse(protocolCall("foo://bar"), [[ops.scope, "foo"], "bar"]);
    assertParse(protocolCall("fn:/a/b"), [[ops.scope, "fn"], "a", "b"]);
  });

  it("singleQuoteString", () => {
    assertParse(singleQuoteString(`''`), "");
    assertParse(singleQuoteString(`'hello'`), "hello");
    assertParse(
      singleQuoteString(String.raw`'escape characters with \'backslash\''`),
      "escape characters with 'backslash'"
    );
  });

  it("slashCall", () => {
    assertParse(slashCall("graph/"), [ops.scope, "graph", undefined]);
    assertParse(slashCall("graph/foo/bar"), [ops.scope, "graph", "foo", "bar"]);
    assertParse(slashCall("//foo/bar"), [ops.scope, "foo", "bar"]);
    assertParse(slashCall("a/b/c.txt"), [ops.scope, "a", "b", "c.txt"]);
  });

  it("slashPath", () => {
    assertParse(slashPath("foo/bar/baz"), ["foo", "bar", "baz"]);
    assertParse(slashPath("foo/bar/baz/"), ["foo", "bar", "baz", undefined]);
  });

  it("slashCalls with functions", () => {
    assertParse(expression("fn()/key"), [[[ops.scope, "fn"]], "key"]);
    assertParse(expression("(fn())/key"), [[[ops.scope, "fn"]], "key"]);
    assertParse(slashCall("fn('a', 'b')/c/d"), [
      [[ops.scope, "fn"], "a", "b"],
      "c",
      "d",
    ]);
    assertParse(expression("graph/key()"), [[ops.scope, "graph", "key"]]);
    assertParse(expression("fn1()/fn2()"), [[[[ops.scope, "fn1"]], "fn2"]]);
  });

  it("spacePathCall", () => {
    assertParse(spacePathCall(".. .. .. foo bar"), [
      ops.scope,
      "..",
      "..",
      "..",
      "foo",
      "bar",
    ]);
  });

  it("spaceUrl", () => {
    assertParse(spaceUrl("https example.com foo bar.json"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assertParse(spaceUrl("http example.org {{x}} data.json"), [
      [ops.scope, "http"],
      "example.org",
      [ops.scope, "x"],
      "data.json",
    ]);
  });

  it("substitution", () => {
    assertParse(substitution("{{foo}}"), [ops.scope, "foo"]);
  });

  it("templateDocument", () => {
    assertParse(
      templateDocument("Documents can contain ` backticks"),
      "Documents can contain ` backticks"
    );

    assertParse(
      templateDocument(`{{fn =\`
        Hello
      \` }}`),
      [
        ops.concat,
        [
          [ops.scope, "fn"],
          [ops.lambda, "        Hello\n"],
        ],
      ]
    );

    assertParse(
      templateDocument(`Start
  {{fn =\`
    Block contents
  \`}}
End`),
      [
        ops.concat,
        "Start\n",
        [
          [ops.scope, "fn"],
          [ops.lambda, "    Block contents\n"],
        ],
        "End",
      ]
    );

    assertParse(
      templateDocument(`
\`\`\`md
{{ sample.md }}
\`\`\`
`),
      [ops.concat, "\n```md\n", [ops.scope, "sample.md"], "\n```\n"]
    );

    assertParse(
      templateDocument(`
  <ul>
  {{ map names, =\`
    <li>{{ @value }}</li>
  \`}}
  </ul>
`),
      [
        ops.concat,
        "\n  <ul>\n",
        [
          [ops.scope, "map"],
          [ops.scope, "names"],
          [
            ops.lambda,
            [ops.concat, "    <li>", [ops.scope, "@value"], "</li>\n"],
          ],
        ],
        "  </ul>\n",
      ]
    );
  });

  it("templateLiteral", () => {
    assertParse(templateLiteral("`Hello, world.`"), "Hello, world.");
    assertParse(templateLiteral("`foo { bar } baz`"), "foo { bar } baz");
    assertParse(
      templateLiteral("`escape characters with \\`backslash\\``"),
      "escape characters with `backslash`"
    );
  });

  it("templateLiteral with substitution", () => {
    assertParse(templateLiteral("``"), "");
    assertParse(templateLiteral("`{{x}}.json`"), [
      ops.concat,
      [ops.scope, "x"],
      ".json",
    ]);
    assertParse(templateLiteral("`foo {{x}}.json bar`"), [
      ops.concat,
      "foo ",
      [ops.scope, "x"],
      ".json bar",
    ]);
    assertParse(templateLiteral("`foo {{ fn(a) }} bar`"), [
      ops.concat,
      "foo ",
      [
        [ops.scope, "fn"],
        [ops.scope, "a"],
      ],
      " bar",
    ]);
    assertParse(templateLiteral("`{{`nested`}}`"), "nested");
    assertParse(templateLiteral("`{{map(people, =`{{name}}`)}}`"), [
      ops.concat,
      [
        [ops.scope, "map"],
        [ops.scope, "people"],
        [ops.lambda, [ops.concat, [ops.scope, "name"]]],
      ],
    ]);
  });

  it("thisReference", () => {
    assertParse(thisReference("this"), [ops.thisKey]);
    // If there's an extension after the 'this' keyword, it's a reference.
    // assert.equal(thisReference("this.foo"), null);
  });

  it("urlProtocolCall", () => {
    assertParse(urlProtocolCall("https://example.com/foo/"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      undefined,
    ]);
    assertParse(urlProtocolCall("https://example.com/foo/bar.json"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assertParse(urlProtocolCall("https:example.com"), [
      [ops.scope, "https"],
      "example.com",
    ]);
  });

  it("urlProtocolCall with functionComposition", () => {
    assertParse(expression("https://example.com/graph.yaml 'key'"), [
      [[ops.scope, "https"], "example.com", "graph.yaml"],
      "key",
    ]);
  });

  it("whitespace", () => {
    assert.deepEqual(optionalWhitespace("   hello"), {
      value: true,
      rest: "hello",
    });
  });
});

function assertParse(parseResult, expected) {
  if (expected === null) {
    assert.isNull(parseResult);
  } else {
    assert(parseResult);
    assert.equal(parseResult.rest, "");
    assert.deepEqual(parseResult.value, expected);
  }
}
