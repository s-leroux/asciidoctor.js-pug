// Boilerplate...
if (typeof Opal === 'undefined') {
  Opal = require('opal-runtime').Opal;
}
const debug = require('debug')('asciidoctor.js-pug:templates');
const asciidoctor = require('asciidoctor.js')();

Opal.top.$require("asciidoctor/document");
var Asciidoctor = Opal.const_get_qualified('::', 'Asciidoctor');
var Document = Opal.const_get_qualified(Asciidoctor, 'Document');

// Load our converter
const TemplateConverter = require('./converter.js');

(function() {
  const outils = require('./opal-utils.js');
  debug("Module start");

  // Patch the factory create method to use our custom TemplateConverter
  // if one of the `template_dir` or `template_dirs` options is defined.
  const inherited = outils.patch(Document, '$create_converter', function() {
    const opts = this.options;

    // Intercept the `template...` options since we will handle them
    // ourselves
    let template_dir = Opal.hash_delete(opts, 'template_dir');
    let template_dirs = Opal.hash_delete(opts, 'template_dirs');
    let templates = Opal.hash_delete(opts, 'templates');

    if (template_dir && template_dirs) {
      throw Error("You cannot specify both the template_dir and the template_dirs options");
    }

    // Sanityze template_dirs to hold an array and to
    // handle the deprecated template_dir (singular)
    if (template_dir) {
      template_dirs = [ template_dir ];
    }

    if (template_dirs) {
      if (typeof template_dirs == "string") {
        template_dirs = [ template_dirs ];
      }

      templates = TemplateConverter.load_templates(template_dirs);
    }

    // Create the base converter. Will *never* be a template converter since
    // we've intercepted template_dirs
    let converter = inherited.call(this, arguments);

    console.log(templates);
    if (templates) {
      converter = TemplateConverter.create(converter, templates);
    }

    return converter;
  });
})();
