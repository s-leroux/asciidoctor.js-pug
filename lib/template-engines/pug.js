const pug = require('pug');
const engine = require('../template-engine.js');

module.exports = engine.create({compileFile: pug.compileFile});
