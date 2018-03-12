if (typeof Opal === 'undefined') {
  Opal = require('opal-runtime').Opal;
}


// Some utilities
function hash_to_native($hash) {
  return $hash.$$smap;
}

const debug = require('debug')('asciidoctor.js-pug:converter');

C = Opal.Class.$new(Opal.Object /*, function(){} */);
Opal.defn(C, '$initialize', function(templates){
  this.templates = templates;
});

Opal.defn(C, '$handles?', function(name){
  debug("handles?", name);
  return this.templates.has(name);
});

// is this method really required?
Opal.defn(C, '$converts?', function(backend){
  return true;
});

Opal.defn(C, '$convert', function(node, template_name, opts){
  template_name = template_name || node_name;

  debug("convert", template_name);
//  console.log("convert", node);

  // Provides a native JS node object to ease interface with pug
  const native_node = Object.create(node);
  native_node.content = () => node.$content();
  native_node.attributes = node.attributes && hash_to_native(node.attributes);

  return this.templates.get(template_name)({
    node: native_node,
    $node:node,
  });
});

module.exports = C;
