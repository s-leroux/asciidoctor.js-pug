// Boilerplate...
if (typeof Opal === 'undefined') {
  Opal = require('opal-runtime').Opal;
}
const debug = require('debug')('asciidoctor.js-pug:templates');
const asciidoctor = require('asciidoctor.js')();

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

(function(template_dir) {
  const outils = require('./opal-utils.js');
  debug("Module start");

  // Patch the factory create method to wrap the standard
  // converted in a composite+template converter if
  // the 'template_dirs' argument is passed
  const inherited = outils.patch(Factory, '$create', function(backend, opts) {
    const converter = inherited.call(this, backend, opts);

    if (opts.template_dirs) {
      const templateConverter = PugConverter.$new(load_templates(template_dirs));
      converter = CompositeConverter.$new(backend, templateConverter, converter);
    }

    return converter;
  });
})();
