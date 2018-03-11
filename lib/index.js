// Boilerplate...
var { Opal } = require('opal-runtime');
var asciidoctor = require('asciidoctor.js')();

Opal.top.$require("asciidoctor/converter/html5");
var Asciidoctor = Opal.const_get_qualified('::', 'Asciidoctor');
var Converter = Opal.const_get_qualified(asciidoctor, 'Converter');
var Html5Converter = Opal.const_get_qualified(Converter, 'Html5Converter');

Opal.top.$require("asciidoctor/converter/factory");
var Factory = Opal.const_get_qualified(Converter, 'Factory');

Opal.top.$require("asciidoctor/converter/composite");
var CompositeConverter = Opal.const_get_qualified(Converter, 'CompositeConverter');

// Load our converter
const PugConverter = require('./converter.js');

// Register globally as the new html5 converter:
const opts = Opal.hash2([], {});
const HTML5 = "html5";
Factory.$register(CompositeConverter.$new(HTML5,
    PugConverter.$new(),
    Html5Converter.$new(HTML5, opts)
  ), [HTML5]
);
