const outils = require('./opal-utils.js');
const debug = require('debug')('asciidoctor.js-pug:templates');
const asciidoctor = require('asciidoctor.js')();

Opal.top.$require("asciidoctor/document");
var Asciidoctor = Opal.const_get_qualified('::', 'Asciidoctor');
var Document = Opal.const_get_qualified(Asciidoctor, 'Document');

// Load our converter
const TemplateConverter = require('./converter.js');

(function() {
  debug("Module start");

  // Patch the Document create_converter method to use our custom TemplateConverter
  // if one of the `template_dir` or `template_dirs` options is defined.
  const inherited = outils.patch(Document, '$create_converter', function() {
    const opts = this.options;

    /*
      `templates` is assumed to be an array of objets
      each object provides one method for each block it converts
      named as the block name:

      [{
        paragraph: (ctx) => ...,
        image: (ctx) => ...,
      },{
        image: (ctx) => ...,
      }]

      Only first matching template of the array is directly called.
      A template can forward control to the next template of the chain
      by calling ctx.next(). This can be used to implement a decorator
      pattern:

      ctx.next() will invoke the default converter if there is no more templates
      in the chain.

      [{
        paragraph: (ctx) => `<div class="para">${ctx.next()}</div>`,
      }]

      For compatibility with the Ruby template API, if `template_dirs` is
      defined, the templates are loaded from the given directories and
      added *at the end* of the templates array.

    */
    let templates = Opal.hash_delete(opts, 'templates') || [];

    // Intercept the `template...` options since we will handle them
    // ourselves
    let template_dir = Opal.hash_delete(opts, 'template_dir');
    let template_dirs = Opal.hash_delete(opts, 'template_dirs');

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

      // According to the Ruby template API semantic, if there are several matching
      // templates, the last one wins
      template_dirs.forEach((template) => {
        templates = [TemplateConverter.load_templates(template_dirs)].concat(templates);
      });
    }

    // Create the base converter. Will *never* be a template converter since
    // we've intercepted template* options
    let converter = inherited.call(this, arguments);

    debug(templates);
    if (templates) {
      converter = TemplateConverter.create(converter, templates);
    }

    return converter;
  });
})();
