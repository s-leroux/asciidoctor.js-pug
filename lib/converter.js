const debug = require('debug')('asciidoctor.js-pug:converter');
const outils = require('../lib/opal-utils.js');
const glob = require('glob');
const path = require('path');
const engines = require('./template-engines.js');


// Some utilities
function hash_to_native($hash) {
  return $hash.$$smap;
}

/**
  Load all templates from a directory and store them in a map.
*/
module.exports.load_templates = load_templates;
function load_templates(template_dirs) {

  const templates = {};

  // XXX it is unfortunate to use a synchronous method here...
  template_dirs.forEach((template_dir) => {
    for(let file of glob.sync(path.join(template_dir, "*.*"))) {
      debug("Load", file);
      const { name, ext } = path.parse(file);
      const engine = engines[ext];

      if (!engine) {
        throw Error(`Unknown template extension ${ext} for ${file}`);
      }

      templates[name] = engine.compileFile(file);
    }
  });

  return templates;
}

module.exports.create = create;
function create(base_converter, templates) {
  let converter = Object.create(base_converter);

  converter.$convert = function(node, template_name, opts) {
    const this_converter = this;
    template_name = template_name || node.node_name;

    debug("convert", template_name);
    //  console.log("convert", node);

    // Provides a native JS node object to ease interfacing
    const native_node = Object.create(node);
    native_node.content = () => node.$content();
    native_node.image_uri = (target) => node.$image_uri(target);
    native_node.attributes = node.attributes && hash_to_native(node.attributes);

    // Iterate over the array in search of the *first* matching template
    // XXX could use a generator here?
    function nextHandler(startIdx) {
      return function() {
        for(let idx = startIdx; idx < templates.length; ++idx) {
          let template = templates[idx][template_name];
          if (template) {
            debug("Found", template_name);
            // XXX should switch to 'strict mode' to allow tail call optimization
            return template({
              node: native_node,
              $node:node,
              next: nextHandler(idx+1),
            });
          }
        }
        debug("Not found", template_name);
        // No match found. Default to the base converter
        return Object.getPrototypeOf(this_converter).$convert(node, template_name, opts);
      }
    }
    return nextHandler(0)();
  }
  return converter;
}
