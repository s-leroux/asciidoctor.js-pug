var { Opal } = require('opal-runtime');
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
  debug("convert", node.node_name);
//  console.log("convert", node);
  return this.templates.get(node.node_name)({node:node});
});

module.exports = C;
