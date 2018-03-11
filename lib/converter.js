var { Opal } = require('opal-runtime');
const debug = require('debug')('asciidoctor.js-pug:converter');

C = Opal.Class.$new(Opal.Object /*, function(){} */);
Opal.defn(C, '$initialize', function(){
})

Opal.defn(C, '$handles?', function(name){
  debug("handles?", name);
  return (name=="inline_anchor");
});

Opal.defn(C, '$converts?', function(backend){
  return true;
});

Opal.defn(C, '$convert', function(node, template_name, opts){
  debug("convert", node.node_name);
//  console.log("convert", node);
  return "["+node.node_name+"]";
});

module.exports = C;
