const asciidoctor = require('asciidoctor.js')();
require('../index.js')('./test/templates');

const debug = require('debug')('asciidoctor.js-pug:tests');
const assert = require('chai').assert;

describe("asciidoctor", function() {
  it("should convert simple texts", function() {
    const doc = asciidoctor.loadFile('./test/data/001-plain-text.adoc');
    const html = doc.convert();
    debug(html);
  });

  it("should find templates for block elements", function() {
    const doc = asciidoctor.loadFile('./test/data/002-blocks.adoc');
    const html = doc.convert();

    debug(html);
    assert.include(html, '<PARA>');
  });

  it("should find href and anchor's target", function() {
    const doc = asciidoctor.loadFile('./test/data/003-anchors.adoc');
    const html = doc.convert();
    debug(html);
    
    assert.include(html, '<A HREF="http://asciidoctor.org">asciidoctor</A>');
  });

  it("should access attributes", function() {
    const doc = asciidoctor.loadFile('./test/data/004-attributes.adoc');
    const html = doc.convert();
    debug(html);
    
    assert.include(html, '<IMG src="source.png" alt="Atl Text Here"></IMG>');
  });

  it("should build proper image URI", function() {
    const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc');
    const html = doc.convert();
    debug(html);
    
    assert.include(html, '<IMG src="https://image.dir/source.png" alt="Atl Text Here"></IMG>');
  });
});
