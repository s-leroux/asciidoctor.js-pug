'use strict'
/* eslint-disable camelcase */

const debug = require('debug')('asciidoctor.js-pug:converter')

// Some utilities
function hash_to_native ($hash) {
  return $hash.$$smap
}

/**
 * Create a new "template" converter
 *
 * @param  {Object} base_converter The base converter. This converter
 *                                 will serve as a fallback if no specific
 *                                 template is found for a given node
 * @param  {Array} templates       An array of templates. Templates are checked
 *                                 in _reverse_ order to find the one that
 *                                 can handle a given node (i.e., last wins)
 *
 * @return {Object}                The new converter
 */
module.exports.create = create
function create (base_converter, templates) {
  let converter = Object.create(base_converter)

  converter.$convert = function (node, template_name, opts) {
    const this_converter = this
    template_name = template_name || node.node_name

    debug('convert', template_name)
    //  console.log("convert", node);

    // Provides a native JS node object to ease interfacing
    const native_node = Object.create(node)
    native_node.content = () => node.$content()
    native_node.image_uri = (target) => node.$image_uri(target)
    native_node.attributes = node.attributes && hash_to_native(node.attributes)

    if (native_node.attributes && native_node.attributes.role) {
      native_node.roles = new Set(` ${native_node.attributes.role} `
        .split(/\s+/)
        .slice(1, -1))
    } else {
      native_node.roles = new Set()
    }

    // Iterate over the array in search of the *last* matching template
    // XXX could use a generator here?
    function nextHandler (end) {
      return function () {
        let idx = end
        while (idx-- > 0) {
          let template = templates[idx][template_name]
          if (template) {
            debug('Found', template_name)
            // XXX should switch to 'strict mode' to allow tail call optimization
            return template(native_node, nextHandler(idx))
          }
        }
        debug('Not found', template_name)
        // No match found. Default to the base converter
        return Object.getPrototypeOf(this_converter).$convert(node, template_name, opts)
      }
    }
    return nextHandler(templates.length)()
  }
  return converter
}
