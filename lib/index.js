// Boilerplate...
if (typeof Opal === 'undefined') {
  Opal = require('opal-runtime').Opal;
}

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

(function(template_dir) {
  const outils = require('./opal-utils.js');

  // Patch the factory create method to wrap the standard
  // converted in a composite+template converter if
  // the 'template_dirs' argument is passed
  const inherited = outils.patch(Factory, '$create', function(backend, opts) {
    const converter = inherited.call(this, backend, opts);

    if (opts.template_dirs) {
      const templateConverter = PugConverter.$new(template_dirs);
      converter = CompositeConverter.$new(backend, templateConverter, converter);
    }

    return converter;
  });
})();

  const debug = require('debug')('asciidoctor.js-pug:templates');
  const glob = require('glob');
  const path = require('path');
  const pug = require('pug');

  const templates = new Map();
  // XXX it is unfortunate to use a synchronous method here...
  for(let file of glob.sync(path.join(template_dir, "*.pug"))) {
    debug("Load", file);
    const key = path.parse(file).name;
    const template = pug.compileFile(file);

    templates.set(key, template);
  }




  // Register globally as the new html5 converter:
  const opts = Opal.hash2([], {});
  const HTML5 = "html5";
  Factory.$register(CompositeConverter.$new(HTML5,
      PugConverter.$new(templates),
      Html5Converter.$new(HTML5, opts)
    ), [HTML5]
  );
})();
