'use strict';

var Minimatch = require("minimatch").Minimatch

let engines = null;

/*

  This module exports an associative array that map filename extentions
  to the corresponding `engine`.

  Each engine should export a `compileFile(filename)` method returning a
  function with the signature `fn(context)` to invoke the corresponding
  template in the context of a given node.

  XXX This definition seems to imply template compilation is synchronous.

*/

register(['*.pug', '*.jade'], require('./template-engines/pug.js'));

/**
 * Register a mapping between a glob pattern and a template engine
 * @param  {string|array} patterns  An array of glob pattern that should match
 *                                  the template filename
 * @param  {engine} engine          The template engine responsible to handle
 *                                  file matching the glob pattern
 */
module.exports.register = register;
function register(patterns, engine) {
  // Is this required?
  // I add that in case pattern is a sub-class of String
  patterns = patterns.valueOf();

  if (typeof patterns == "string")
    patterns = [ patterns ];

  const MinimatchOpts = {
    matchBase: true,
  };
  engines = {
    next: engines,
    matchers: patterns.map((pattern) => new Minimatch(pattern, MinimatchOpts)),
    engine: engine,
  };
}

/**
 * Return the template engine responsible to handle the file whosname
 * is given as parameter.
 * @param  {string} filename  The name of the template file
 * @return {engine|undefined} The engine to handle that file or undefined
 *                            if not found
 */
module.exports.engineFor = engineFor;
function engineFor(filename) {
  function _engineFor(filename, head) {
    if (!head)
      return undefined;

    if (head.matchers.find((matcher) => matcher.match(filename)))
      return head.engine;

    // ECMAScript 6 in strict mode has tail call optimization!
    return _engineFor(filename, head.next);
  }

  return _engineFor(filename, engines);
}
