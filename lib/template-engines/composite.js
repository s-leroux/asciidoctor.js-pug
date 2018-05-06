'use strict'

const Minimatch = require('minimatch').Minimatch
const engine = require('../template-engine.js')

/**
 * Register a mapping between a glob pattern and a template engine
 * @param  {string|array} patterns  An array of glob pattern that should match
 *                                  the template filename
 * @param  {engine} engine          The template engine responsible to handle
 *                                  file matching the glob pattern
 * @return {this}                   Return this to allow chaining register()
 *                                  calls as a fluent interface
 */
function register (patterns, engine) {
  // Is this required?
  // I add that in case pattern is a sub-class of String
  patterns = patterns.valueOf()

  if (typeof patterns === 'string') { patterns = [ patterns ] }

  const MinimatchOpts = {
    matchBase: true
  }
  this.engines = {
    next: this.engines,
    matchers: patterns.map((pattern) => new Minimatch(pattern, MinimatchOpts)),
    engine: engine
  }

  return this
}

/**
 * Return the template engine responsible to handle the file whosname
 * is given as parameter.
 * @param  {string} filename  The name of the template file
 * @return {engine|undefined} The engine to handle that file or undefined
 *                            if not found
 */
function findEngineFor (filename) {
  function _findEngineFor (filename, head) {
    if (!head) { return undefined }

    if (head.matchers.find((matcher) => matcher.match(filename))) { return head.engine }

    // ECMAScript 6 in strict mode has tail call optimization!
    return _findEngineFor(filename, head.next)
  }

  return _findEngineFor(filename, this.engines)
}

function compileFile (fullname) {
  const engine = this.findEngineFor(fullname)
  if (engine) {
    return engine.compileFile(fullname)
  }

  return undefined
}

/**
 * Return a new template engine
 * @return {[type]}          [description]
 */
module.exports.create = create
function create () {
  const self = engine.create()
  self.compileFile = compileFile
  self.register = register
  self.findEngineFor = findEngineFor

  return self.register(['*.pug', '*.jade'], require('./pug.js'))
}
