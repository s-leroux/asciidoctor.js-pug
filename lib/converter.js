const debug = require('debug')('asciidoctor.js-pug:converter');
const outils = require('../lib/opal-utils.js');


// Some utilities
function hash_to_native($hash) {
  return $hash.$$smap;
}

const C = outils.subclass({
  '$initialize': function(templates){
    debug("$initialize", templates);
    this.templates = templates;
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

module.exports = C;
