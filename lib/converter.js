const debug = require('debug')('asciidoctor.js-pug:converter');
const outils = require('../lib/opal-utils.js');


// Some utilities
function hash_to_native($hash) {
  return $hash.$$smap;
}

/**
  Load all templates from a directory and store them in a map.
*/
module.exports.load_templates = load_templates;
function load_templates(template_dirs) {
  const glob = require('glob');
  const path = require('path');
  const pug = require('pug');

  const templates = {};

  // XXX it is unfortunate to use a synchronous method here...
  template_dirs.forEach((template_dir) => {
    for(let file of glob.sync(path.join(template_dir, "*.pug"))) {
      debug("Load", file);
      const key = path.parse(file).name;
      const template = pug.compileFile(file);

      templates[key]=template;
    }
  });

  return templates;
}

module.exports.create = create;
function create(base_converter, template_dirs) {
  let converter = Object.create(base_converter);

  let templates = load_templates(template_dirs);

  converter.$convert = function(node, template_name, opts) {
    template_name = template_name || node.node_name;

    debug("convert", template_name);
    //  console.log("convert", node);

    // Provides a native JS node object to ease interface with pug
    const native_node = Object.create(node);
    native_node.content = () => node.$content();
    native_node.image_uri = (target) => node.$image_uri(target);
    native_node.attributes = node.attributes && hash_to_native(node.attributes);


    let template = templates[template_name];
    if (template) {
      return template({
        node: native_node,
        $node:node,
      });
    }

    // fallback
    return Object.getPrototypeOf(this).$convert(node, template_name, opts);
  };

  return converter;
}
