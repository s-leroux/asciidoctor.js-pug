const base = require('../lib/template-engine.js');
const composite = require('../lib/template-engines/composite.js');

const debug = require('debug')('asciidoctor.js-pug:test-template-engine');
const assert = require('chai').assert;

// Because Chai assert.deepEqual hangs on circular depedencies introduced
// by Opal in the Array prototype... :/
assert.toStringEqual = function(actual, expected, msg) {
  assert.equal(actual.toString(), expected.toString(), msg);
}

describe("template-engine", function() {
  it("should override compileFile if provided in options", function() {
    const fn = function(){};
    const engine = base.create({ compileFile: fn });

    assert.strictEqual(engine.compileFile, fn);
  });

  it("should load all files in a directory", function() {
    const expected = [
      'test/test-directory/README',
      'test/test-directory/a.pug',
      'test/test-directory/b.jade',
      'test/test-directory/c.dust',
      'test/test-directory/d.mustache',
      'test/test-directory/dir',
    ];

    const files = [];
    const fn = function(filename) { files.push(filename); }
    const engine = base.create({ compileFile: fn });

    engine.load("test/test-directory");

    files.sort();
    expected.sort();
    assert.toStringEqual(files, expected);
  });
});
