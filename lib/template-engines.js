'use strict';

const fs = require('fs');
const path = require('path');
const Minimatch = require("minimatch").Minimatch

/*

  This module exports an associative array that map filename extentions
  to the corresponding `engine`.

  Each engine should export a `compileFile(filename)` method returning a
  function with the signature `fn(context)` to invoke the corresponding
  template in the context of a given node.

  XXX This definition seems to imply template compilation is synchronous.

*/

/**
 * Register a mapping between a glob pattern and a template engine
 * @param  {string|array} patterns  An array of glob pattern that should match
 *                                  the template filename
 * @param  {engine} engine          The template engine responsible to handle
 *                                  file matching the glob pattern
 */
function register(patterns, engine) {
  // Is this required?
  // I add that in case pattern is a sub-class of String
  patterns = patterns.valueOf();

  if (typeof patterns == "string")
    patterns = [ patterns ];

  const MinimatchOpts = {
    matchBase: true,
  };
  this.engines = {
    next: this.engines,
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
function findEngineFor(filename) {
  function _findEngineFor(filename, head) {
    if (!head)
      return undefined;

    if (head.matchers.find((matcher) => matcher.match(filename)))
      return head.engine;

    // ECMAScript 6 in strict mode has tail call optimization!
    return _findEngineFor(filename, head.next);
  }

  return _findEngineFor(filename, this.engines);
}

/**
 * Load all templates files contained in the given directory using the
 * first template engine matching the filename
 *
 * @param  {path}   template_dirs Path to the directory containing the
 *                                template files
 * @return {object}               An object having a method for each
 *                                loaded template
 */
function load(template_dirs) {

  const templates = {};

  // XXX it is unfortunate to use a synchronous method here...
  template_dirs.forEach((template_dir) => {
    for(let filename of fs.readdirSync(template_dir)) {
      const fullname = path.join(template_dir, filename);

      // XXX Should probably test here if this is a plain file and
      // not a directory or something else
      const engine = this.findEngineFor(fullname);
      if (engine) {
        const { name, ext } = path.parse(fullname);
        templates[name] = engine.compileFile(fullname);
      }
    }
  });

  return templates;
}


/**
 * Return a new template engine
 * @return {[type]}          [description]
 */
module.exports.create = create;
function create() {
  const engine = {
    register: register,
    findEngineFor: findEngineFor,
    load: load,
    engines: null,
  };

  engine.register(['*.pug', '*.jade'], require('./template-engines/pug.js'));

  return engine;
}
