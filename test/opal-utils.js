'use strict'

/* global describe, it, Opal */
/* eslint-disable no-unused-vars */

if (typeof Opal === 'undefined') {
  require('opal-runtime')
}

const outils = require('../lib/opal-utils.js')
// const debug = require('debug')('asciidoctor.js-pug:opal-utils')
const assert = require('chai').assert

describe('opal-utils', function () {
  /**
    Create a new Opal class defining the $m and $self method for
    testing purposes.
  */
  const opalClass = function () {
    const C = Opal.Class.$new(Opal.Object /*, function(){} */)
    Opal.defn(C, '$initialize', function () { this.baseInitializeCalled = true })
    Opal.defn(C, '$m', function () { return 'original' })
    Opal.defn(C, '$self', function () { return this })

    return C
  }

  describe('opal runtime', function () {
    //
    // Test some assumptions I've made about the Opal runtime
    //
    it('should pass Opal object as this to JS methods', function () {
      const klass = opalClass()
      const obj = klass.$new()
      assert.strictEqual(obj.$self(), obj)
    })

    it('should store methods in the $$proto class field', function () {
      const klass = opalClass()
      const obj = klass.$new()
      assert.strictEqual(klass.$$proto.$m, obj.$m)
    })
  })

  describe('const_get_qualified', function () {
    // const debug = require('debug')('asciidoctor.js-pug:opal-utils-modules')

    require('asciidoctor.js')() // Can't we avoid that depedency here?

    it('should find a root module by absolute path', function () {
      const module = outils.const_get_qualified('::Asciidoctor')
      assert.equal(module.$$name, 'Asciidoctor')
    })

    it('should find a root module by relative path from root', function () {
      const module = outils.const_get_qualified('::', 'Asciidoctor')
      assert.equal(module.$$name, 'Asciidoctor')
    })

    it('should find a nested module by absolute path', function () {
      const module = outils.const_get_qualified('::Asciidoctor::Converter')
      assert.equal(module.$$name, 'Converter')
    })

    it('should find a nested module by relative path', function () {
      const base = outils.const_get_qualified('::', 'Asciidoctor')
      const module = outils.const_get_qualified(base, 'Converter')
      assert.equal(module.$$name, 'Converter')
    })

    it('should ignore base for absolute paths', function () {
      const base = outils.const_get_qualified('::', 'Asciidoctor')
      const module = outils.const_get_qualified(base, '::Asciidoctor::Converter')
      assert.equal(module.$$name, 'Converter')
    })

    it('should return `undefined` for missing module', function () {
      const module = outils.const_get_qualified('::Asciidoctor::XYZ')
      assert.isUndefined(module)
    })
  })

  describe('patch', function () {
    it('should replace existing methods', function () {
      const klass = opalClass()
      outils.patch(klass, '$m', function () {
        return 'patched'
      })

      const obj = klass.$new()
      assert.equal(obj.$m(), 'patched')
    })

    it('should be applied to exising objects', function () {
      const klass = opalClass()
      const obj = klass.$new() // create object BEFORE patching the class

      outils.patch(klass, '$m', function () {
        return 'patched'
      })

      assert.equal(obj.$m(), 'patched')
    })

    it('should pass Opal object as this to *patched* JS methods', function () {
      const klass = opalClass()
      const obj = klass.$new() // create object BEFORE patching the class

      outils.patch(klass, '$self', function () {
        return this
      })
      assert.strictEqual(obj.$self(), obj)
    })

    it('should return the inherited method', function () {
      /*
        The idea is you have to use a closure to keep the original
        method when you want to be able to call super():

        ex.

        const super = outils.patch(klass, "$m", function() {
          ...
          return super();
        });
       */
      const klass = opalClass()
      const obj = klass.$new() // create object BEFORE patching the class
      const original = obj['$m']

      const result = outils.patch(klass, '$m', function () {
        return 'patched'
      })

      assert.strictEqual(result, original)
    })

    it('should allow calling the inherited method', function () {
      /*
        The idea is you have to use a closure to keep the original
        method when you want to be able to call super():

        ex.

        const super = outils.patch(klass, "$m", function() {
          ...
          return super();
        });
       */
      const klass = opalClass()
      const obj = klass.$new() // create object BEFORE patching the class

      const inherited = outils.patch(klass, '$m', function () {
        return 'patched+' + inherited.call(this) // XXX maybe should I bind() the result?
      })

      assert.equal(obj.$m(), 'patched+original')
    })
  })

  describe('subclass', function () {
    it('should create new anonymous Opal-like class', function () {
      const base = opalClass()
      const sub = outils.subclass(base, {})

      const obj = sub.$new()
      assert.equal(obj.$m(), 'original')
    })

    it('should create new named Opal-like class', function () {
      const base = opalClass()
      const sub = outils.subclass(
        outils.const_get_qualified('::Asciidoctor'),
        base, 'XYZ', {})

      const klass = outils.const_get_qualified('::Asciidoctor::XYZ')
      const obj = klass.$new()
      assert.equal(obj.$m(), 'original')
    })

    it('should properly set the inheritance chain', function () {
      const base = opalClass()
      const sub = outils.subclass(base, {})

      assert.isTrue(sub.$$parent === base) // strictEqual has issues with circular refs.
    })

    it('should allow overriding Opal base-class methods', function () {
      const base = opalClass()
      const sub = outils.subclass(base, {
        '$m': function () {
          return 'overridden'
        }
      })

      const obj = sub.$new()
      assert.equal(obj.$m(), 'overridden')
    })

    it('should allow overriding base-class methods in named Opal-like class', function () {
      const base = opalClass()
      const sub = outils.subclass(
        outils.const_get_qualified('::Asciidoctor'),
        base, 'ABC', {
          '$m': function () {
            return 'overridden'
          }
        })

      const klass = outils.const_get_qualified('::Asciidoctor::ABC')
      const obj = klass.$new()
      assert.equal(obj.$m(), 'overridden')
    })

    it('should allow calling the inherited method', function () {
      const base = opalClass()
      const sub = outils.subclass(base, {
        '$m': function () {
          return 'overridden+' + this.inherited(base, '$m')()
        }
      })

      const obj = sub.$new()
      assert.equal(obj.$m(), 'overridden+original')
    })

    it('should allow calling the inherited constructor', function () {
      const base = opalClass()
      const sub = outils.subclass(base, {
        '$initialize': function () {
          this.derivedInitializeCalled = true
          this.inherited(base, '$initialize')()
        }
      })

      const obj = sub.$new()
      assert.isTrue(obj.baseInitializeCalled)
      assert.isTrue(obj.derivedInitializeCalled)
    })

    it('should allow calling the inherited method [several levels of subclassing]', function () {
      const base = opalClass()
      const sub = outils.subclass(base, {
        '$m': function () {
          return 'overridden+' + this.inherited(base, '$m')()
        }
      })
      const sub2 = outils.subclass(sub, {
        '$m': function () {
          return 'level3+' + this.inherited(sub, '$m')()
        }
      })

      const obj = sub2.$new()
      assert.equal(obj.$m(), 'level3+overridden+original')
    })

    it('should share context beween JS calls', function () {
      const base = opalClass()
      const sub = outils.subclass(base, {
        'set': function () {
          this.value = 1
        },
        'get': function () {
          return this.value
        }
      })

      const obj = sub.$new()
      obj.set()
      assert.equal(obj.get(), 1)
    })
  })
})
