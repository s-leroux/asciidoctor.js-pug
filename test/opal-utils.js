if (typeof Opal === 'undefined') {
  Opal = require('opal-runtime').Opal;
}

const outils = require('../lib/opal-utils.js');
const debug = require('debug')('asciidoctor.js-pug:opal-utils');
const assert = require('chai').assert;


describe("opal-utils", function() {
  const opalClass = function() {
    const C = Opal.Class.$new(Opal.Object /*, function(){} */);
    Opal.defn(C, '$m', function(){ return "original"; });
    Opal.defn(C, '$self', function(){ return this; });

    return C;
  };

  describe("opal runtime", function() {
    //
    // Test some assumptions I've made about the Opal runtime
    //
    it("should pass Opal object as this to JS methods", function() {
      const klass = opalClass();
      const obj = klass.$new();
      assert.strictEqual(obj.$self(), obj);
    });

    it("should store methods in the $$proto class field", function() {
      const klass = opalClass();
      const obj = klass.$new();
      assert.strictEqual(klass.$$proto.$m, obj.$m);
    });

  });

  describe("patch", function() {
    it("should replace existing methods", function() {
      const klass = opalClass();
      outils.patch(klass, "$m", function() {
        return "patched";
      });

      const obj = klass.$new();
      assert.equal(obj.$m(), "patched");
    });

    it("should be applied to exising objects", function() {
      const klass = opalClass();
      const obj = klass.$new(); // create object BEFORE patching the class

      outils.patch(klass, "$m", function() {
        return "patched";
      });

      assert.equal(obj.$m(), "patched");
    });

    it("should pass Opal object as this to *patched* JS methods", function() {
      const klass = opalClass();
      const obj = klass.$new(); // create object BEFORE patching the class

      outils.patch(klass, "$self", function() {
        return this;
      });
      assert.strictEqual(obj.$self(), obj);
    });

    it("should return the inherited method", function() {
      /*
        The idea is you have to use a closure to keep the original
        method when you want to be able to call super():

        ex.

        const super = outils.patch(klass, "$m", function() {
          ...
          return super();
        });
       */
      const klass = opalClass();
      const obj = klass.$new(); // create object BEFORE patching the class
      const original = obj['$m'];

      const result = outils.patch(klass, "$m", function() {
        return "patched";
      });

      assert.strictEqual(result, original);
    });

    it("should allow calling the inherited method", function() {
      /*
        The idea is you have to use a closure to keep the original
        method when you want to be able to call super():

        ex.

        const super = outils.patch(klass, "$m", function() {
          ...
          return super();
        });
       */
      const klass = opalClass();
      const obj = klass.$new(); // create object BEFORE patching the class

      const inherited = outils.patch(klass, "$m", function() {
        return "patched+" + inherited.call(this); // XXX maybe should I bind() the result?
      });

      assert.equal(obj.$m(), "patched+original");
    });

  });
});
