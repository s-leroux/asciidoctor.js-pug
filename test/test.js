const adp = require('../index.js');
const asciidoctor = require('asciidoctor.js')();

describe("asciidoctor", function() {
  it("should convert simple texts", function() {
    const doc = asciidoctor.loadFile('./test/data/001-plain-text.adoc');
    const html = doc.convert();
  });
});
