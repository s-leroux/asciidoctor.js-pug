/* global describe, it */

const asciidoctor = require('asciidoctor.js')()
require('asciidoctor.js-template')

const debug = require('debug')('asciidoctor.js-pug:tests')
const assert = require('chai').assert

describe('asciidoctor', function () {
  it('bypass template engine if no template_dir', function () {
    const doc = asciidoctor.loadFile('./test/data/001-plain-text.adoc')
    const html = doc.convert()
    assert.include(html, '</p>')
    assert.notInclude(html, '</PARA>')
    debug(html)
  })

  it('should convert simple texts', function () {
    const doc = asciidoctor.loadFile('./test/data/001-plain-text.adoc', {
      template_dirs: './test/templates',
      template_engines: [{
        patterns: '*.pug',
        engine: require('../index.js')
      }]
    })
    const html = doc.convert()
    debug(html)
  })

  it('should find templates for block elements', function () {
    const doc = asciidoctor.loadFile('./test/data/002-blocks.adoc', {
      template_dirs: './test/templates',
      template_engines: [{
        patterns: '*.pug',
        engine: require('../index.js')
      }]
    })
    const html = doc.convert()

    debug(html)
    assert.include(html, '<PARA>')
  })

  it("should find href and anchor's target", function () {
    const doc = asciidoctor.loadFile('./test/data/003-anchors.adoc', {
      template_dirs: './test/templates',
      template_engines: [{
        patterns: '*.pug',
        engine: require('../index.js')
      }]
    })
    const html = doc.convert()
    debug(html)

    assert.include(html, '<A HREF="http://asciidoctor.org">asciidoctor</A>')
  })

  it('should access attributes', function () {
    const doc = asciidoctor.loadFile('./test/data/004-attributes.adoc', {
      template_dirs: './test/templates',
      template_engines: [{
        patterns: '*.pug',
        engine: require('../index.js')
      }]
    })
    const html = doc.convert()
    debug(html)

    assert.include(html, '<IMG src="source.png" alt="Atl Text Here"></IMG>')
  })

  it('should build proper image URI', function () {
    const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
      template_dirs: './test/templates',
      template_engines: [{
        patterns: '*.pug',
        engine: require('../index.js')
      }]
    })
    const html = doc.convert()
    debug(html)

    assert.include(html, '<IMG src="https://image.dir/source.png" alt="Atl Text Here"></IMG>')
  })

  it('should accept an array as `templates` parameter', function () {
    const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
      templates: [{
        image: () => 'IMAGE-REMOVED'
      }]
    })
    const html = doc.convert()
    debug(html)

    assert.include(html, 'IMAGE-REMOVED')
  })

  it('should accept an object as `templates` parameter', function () {
    const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
      templates: {
        image: () => 'IMAGE-REMOVED'
      }
    })
    const html = doc.convert()
    debug(html)

    assert.include(html, 'IMAGE-REMOVED')
  })

  it('should accept empty `templates` parameter', function () {
    const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
      templates: []
    })
    const html = doc.convert()
    debug(html)

    assert.include(html, '<img src="https://image.dir/source.png" alt="Atl Text Here">')
  })

  it('should give priority to the last matching template', function () {
    const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
      templates: [
        { image: (node) => 'IMAGE1' },
        { image: (node) => 'IMAGE2' },
        { image: (node) => 'IMAGE3' }
      ]
    })
    const html = doc.convert()
    debug(html)

    assert.notInclude(html, 'IMAGE1')
    assert.notInclude(html, 'IMAGE2')
    assert.include(html, 'IMAGE3')
  })

  describe('template_engines', function () {
    it('should accept custom extensions as glob patterns', function () {
      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        template_dirs: [
          './test/templates-alt'
        ],
        template_engines: [{
          patterns: '*.xyz',
          engine: require('../index.js')
        }]
      })
      const html = doc.convert()
      debug(html)

      assert.include(html, '<PARA>')
      assert.notInclude(html, '<IMG')
    })

    it('should accept a star as catch all glob pattern', function () {
      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        template_dirs: [
          './test/templates-alt'
        ],
        template_engines: [{
          patterns: '*',
          engine: require('../lib/index.js')
        }]
      })
      const html = doc.convert()
      debug(html)

      assert.include(html, '<PARA>')
      assert.include(html, '<IMG')
    })

    it('should accept a composite engine object as argument to template_engines', function () {
      const composite = require('asciidoctor.js-template').composite
      const engine = composite.create()
        .register('*.xyz', require('../lib/index.js'))

      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        template_dirs: [
          './test/templates-alt'
        ],
        template_engines: engine
      })
      const html = doc.convert()
      debug(html)

      assert.include(html, '<PARA>')
      assert.notInclude(html, '<IMG')
    })

    it('should accept an engine object as argument to template_engines', function () {
      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        template_dirs: [
          './test/templates-alt'
        ],
        template_engines: require('../lib/index.js')
      })
      const html = doc.convert()
      debug(html)

      assert.include(html, '<PARA>')
      assert.include(html, '<IMG')
    })
  })

  describe('next()', function () {
    it('should be present in the context', function () {
      let passed = false // Prevent evergreen tests
      const doc = asciidoctor.loadFile('./test/data/006-roles.adoc', {
        templates: [{
          paragraph: (node, next) => { assert.isFunction(next); passed = true; return '' }
        }]
      })
      const html = doc.convert()
      debug(html)

      assert.isTrue(passed)
    })

    it('should give pass control to the next template', function () {
      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        templates: [
          { image: (node, next) => 'IMAGE1' },
          { image: (node, next) => 'IMAGE2' },
          { image: (node, next) => next() }
        ]
      })
      const html = doc.convert()
      debug(html)

      assert.notInclude(html, 'IMAGE1')
      assert.include(html, 'IMAGE2')
      assert.notInclude(html, 'IMAGE3')
    })

    it('should give pass control to the next matching template', function () {
      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        templates: [
          { image: (node, next) => 'IMAGE1' },
          { },
          { image: (node, next) => next() }
        ]
      })
      const html = doc.convert()
      debug(html)

      assert.include(html, 'IMAGE1')
      assert.notInclude(html, 'IMAGE2')
      assert.notInclude(html, 'IMAGE3')
    })

    it('should give pass control to default handler if no next template', function () {
      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        templates: [
          { image: (node, next) => next() }
        ]
      })
      const html = doc.convert()
      debug(html)

      assert.include(html, '<img src="https://image.dir/source.png" alt="Atl Text Here">')
    })

    it('should give pass control to default handler if no next template (chain)', function () {
      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        templates: [
          { image: (node, next) => next() },
          { image: (node, next) => next() },
          { image: (node, next) => next() },
          { image: (node, next) => next() }
        ]
      })
      const html = doc.convert()
      debug(html)

      assert.include(html, '<img src="https://image.dir/source.png" alt="Atl Text Here">')
    })

    it('should allow to implement a decorator pattern', function () {
      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        templates: [
          { image: (node, next) => `<div class="IMG">${next()}</div>` }
        ]
      })
      const html = doc.convert()
      debug(html)

      assert.match(html, RegExp('<div class="IMG">[\\s\\S]*<img src="https://image.dir/source.png" alt="Atl Text Here">[\\s\\S]*</div>'))
    })

    it('should chain decorators', function () {
      const doc = asciidoctor.loadFile('./test/data/005-img-uri.adoc', {
        templates: [
          { image: (node, next) => `<D>${next()}</D>` },
          { image: (node, next) => `<C>${next()}</C>` },
          { image: (node, next) => `<B>${next()}</B>` },
          { image: (node, next) => `<A>${next()}</A>` }
        ]
      })
      const html = doc.convert()
      debug(html)

      assert.match(html, /<A><B><C><D><div class="imageblock">[\s\S]*<\/div><\/D><\/C><\/B><\/A>/)
    })

    it('should allow to conditionally pass control to the base template', function () {
      const doc = asciidoctor.loadFile('./test/data/006-roles.adoc', {
        templates: [{
          paragraph: (node, next) => {
            if (node.hasRole('Role1')) {
              return 'ROLE1 REMOVED'
            }

            // else
            return next()
          }
        }]
      })
      const html = doc.convert()
      debug(html)

      assert.include(html, 'ROLE1 REMOVED')
      assert.notInclude(html, 'This has the first role')
      assert.include(html, 'This has the second role')
      assert.notInclude(html, 'This has both roles')
    })
  })
})
