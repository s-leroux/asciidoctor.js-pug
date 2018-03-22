const debug = require('debug')('asciidoctor.js-pug:converter');
const outils = require('../lib/opal-utils.js');


// Some utilities
function hash_to_native($hash) {
  return $hash.$$smap;
}

/**
  Load all templates from a directory and store them in a map.
*/
function load_templates(template_dir) {
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

  return templates;
}

// XXX This is still a little bit verbose...
const opal_module = outils.const_get_qualified('::Asciidoctor::Converter');
const opal_base_converter = outils.const_get_qualified('::Asciidoctor::Converter::Base');
const C = outils.subclass(opal_module, opal_base_converter, 'TemplateConverter', {
  '$initialize': function(backend, template_dirs, opts){
    this.templates = load_templates(template_dirs);
  },

  '$handles?': function(name){
    debug("handles?", name);
    return this.templates.has(name);
  },

  // XXX is this method really required?
  '$converts?': function(name){
    return true;
  },

  '$convert': function(node, template_name, opts){
    template_name = template_name || node_name;

    debug("convert", template_name);
    //  console.log("convert", node);

    // Provides a native JS node object to ease interface with pug
    const native_node = Object.create(node);
    native_node.content = () => node.$content();
    native_node.image_uri = (target) => node.$image_uri(target);
    native_node.attributes = node.attributes && hash_to_native(node.attributes);

    return this.templates.get(template_name)({
      node: native_node,
      $node:node,
    });
  },
});

return C;
