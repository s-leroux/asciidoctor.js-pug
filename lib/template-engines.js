const engines = [];

/*

  This module exports an associative array that map filename extentions
  to the corresponding `engine`.

  Each engine should export a `compileFile(filename)` method returning a
  function with the signature `fn(context)` to invoke the corresponding
  template in the context of a given node.

  XXX This definition seems to imply template compilation is synchronous.

*/

engines['.pug'] =
engines['.jade'] = require('./template-engines/pug.js');

module.exports = engines;
