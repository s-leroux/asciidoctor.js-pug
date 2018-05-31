'use strict'

const pug = require('pug')
const engine = require('asciidoctor.js-template').engine

function wrap (template) {
  return (ctx, next) => template({node: ctx, next: next})
}

module.exports = engine.create({
  compileFile: (fullname) => wrap(pug.compileFile(fullname))
})
