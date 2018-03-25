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

// Load our converter
const TemplateConverter = require('./converter.js');

(function(template_dir) {
  const outils = require('./opal-utils.js');
  debug("Module start");

  // Patch the factory create method to wrap the standard
  // converted in a composite+template converter if
  // the 'template_dirs' argument is passed
  const inherited = outils.patch(Factory, '$create', function(backend, opts) {
    // Intercept template_dir{,s}:
    let template_dir = Opal.hash_delete(opts, "template_dir");
    let template_dirs = Opal.hash_delete(opts, "template_dirs");
    let templates = Opal.hash_delete(opts, "templates"); // pre-loaded templates

    if (template_dir && template_dirs) {
      throw Error("You cannot specify both the template_dir and the template_dirs options");
    }

    // Sanityze template_dirs to hold an array and to
    // handle the deprecated template_dir (singular)
    if (template_dir) {
      template_dirs = [ template_dir ];
    }
    if (typeof template_dirs == "string") {
      template_dirs = [ template_dirs ];
    }

    if (templates && template_dirs) {
      throw Error("You cannot specify both the templates and the template_dirs options");
    }

    if (template_dirs) {
      templates = TemplateConverter.load_templates(template_dirs);
    }

    // Create the base converter. Will *never* be a template converter since
    // we've intercepted template_dirs
    let converter = inherited.call(this, backend, opts);

    if (templates) {
      converter = TemplateConverter.create(converter, templates);
    }

    return converter;
  });
})();
