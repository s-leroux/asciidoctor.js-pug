'use strict'
/* eslint-disable camelcase */

const fs = require('fs')
const path = require('path')
// const debug = require('debug')('asciidoctor.js-pug:template-engine')

/**

  This module defines the base class for template engines.

  Each engine should export a `compileFile(filename)` method returning a
  function with the signature `fn(context)` to invoke the corresponding
  template in the context of a given node.

  XXX This definition seems to imply template compilation is synchronous.

  A little bit of vocabulary:
  - a *template* is a file written in some specific template language
    describing how to convert a node object to some text representation
    (HTML, for example)
  - a *template engine* can read and parse a template file and return a function
    that will perform the node transformation
  - a *composite template engine* hold a collection of template engines and
    know which one to use based on the template file name
*/

/**
 * Load all templates files contained in the given directory using the
 * first template engine matching the filename
 *
 * @param  {path}   template_dirs Path to the directory containing the
 *                                template files
 * @return {object}               An object having a method for each
 *                                loaded template
 */
function load (template_dirs) {
  const templates = {}

  template_dirs = template_dirs.valueOf()
  if (typeof template_dirs === 'string') { template_dirs = [ template_dirs ] }

  // XXX it is unfortunate to use a synchronous method here...
  template_dirs.forEach((template_dir) => {
    for (let filename of fs.readdirSync(template_dir)) {
      const fullname = path.join(template_dir, filename)

      // XXX Should probably test here if this is a plain file and
      // not a directory or something else
      const result = this.compileFile(fullname)
      if (result) {
        const { name } = path.parse(fullname)
        templates[name] = result
      }
    }
  })

  return templates
}

function compileFile (fullname) {
  throw new Error('Must be implemented by each engine')
}

/**
 * Return a new template engine
 * @return {[type]}          [description]
 */
module.exports.create = create
function create (opts) {
  opts = opts || {}

  return {
    compileFile: opts.compileFile || compileFile,
    load: load
  }
}
