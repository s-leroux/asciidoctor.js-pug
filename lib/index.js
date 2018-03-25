// Boilerplate...
if (typeof Opal === 'undefined') {
  Opal = require('opal-runtime').Opal;
}
const debug = require('debug')('asciidoctor.js-pug:templates');
const asciidoctor = require('asciidoctor.js')();

Opal.top.$require("asciidoctor/converter/factory");
var Asciidoctor = Opal.const_get_qualified('::', 'Asciidoctor');
var Converter = Opal.const_get_qualified(asciidoctor, 'Converter');
var Factory = Opal.const_get_qualified(Converter, 'Factory');

// Load our converter
const TemplateConverter = require('./converter.js');

(function() {
  const outils = require('./opal-utils.js');
  debug("Module start");

  // Patch the factory create method to use our custom TemplateConverter
  // if one of the `template_dir` or `template_dirs` options is defined.
  const inherited = outils.patch(Factory, '$create', function(backend, opts) {
    debug(opts);
    // Intercept template_dir{,s}:
    let template_dir = Opal.hash_delete(opts, "template_dir");
    let template_dirs = Opal.hash_delete(opts, "template_dirs");

    if (template_dir && template_dirs) {
      throw Error("You cannot specify both the template_dir and the template_dirs options");
    }

    // Sanityze template_dirs to hold an array and to
    // handle the deprecated template_dir (singular)
    if (template_dir) {
      template_dirs = [ template_dir ];
    }

    let templates;
    if (template_dirs) {
      if (typeof template_dirs == "string") {
        template_dirs = [ template_dirs ];
      }

      if (typeof template_dirs.forEach === 'function') {
        // if template_dirs is an Array-like object, load the templates
        templates = TemplateConverter.load_templates(template_dirs);
      }
      else if (typeof template_dirs === 'object'){
        // if template_dirs is an object, assume this is a templae converter
        templates = template_dirs;
      }
      else {
        throw Error("Unsupported template specifications");
      }
    }

    // Create the base converter. Will *never* be a template converter since
    // we've intercepted template_dirs
    let converter = inherited.call(this, backend, opts);

    console.log(templates);
    if (templates) {
      converter = TemplateConverter.create(converter, templates);
    }

    return converter;
  });
})();
