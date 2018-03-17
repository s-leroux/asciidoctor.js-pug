const debug = require('debug')('asciidoctor.js-pug:opal-utils');

/**
  The 'patch' methods allows to dynamically override a method
  from an Opal object.

  The replaced method is returned.
*/
module.exports.patch = patch;
function patch(klass, name, fn) {
  const inherited = klass.$$proto[name];

  Opal.defn(klass, name, fn);
  return inherited;
}

/**
  Subclass an Opal class from JavaScript.

  If the superclass class is not provided, defaults to `Opal.Object`.

  Supports three signatures:
  ```
    // create a named class
    subclass(module, superclass, 'name', { ... })

    // Create an anonymous class
    subclass(superclass, { ... })

    // Create an anonymous class with Object as superclass
    subclass({ ... })
  ```
*/
module.exports.subclass = subclass;
function subclass(base, superclass, id, desc) {
  debug(1);
  if (arguments.length == 1) {
    desc = base;
    superclass = Opal.Object;
    base = id = undefined;
  }
  else if (arguments.length == 2) {
    desc = superclass;
    superclass = base;
    base = id = null;
  }

  debug("klass");
  const C = (id) ? Opal.klass(base, superclass, id, function() {})
                 : Opal.Class.$new(superclass);

  inherited = {}; // the list of the original methods that where patched

  debug("entries");
  for(let [key, value] of Object.entries(desc)) {
    inherited[key] = patch(C, key, value);
  }

  debug("Done", !!C);

  Opal.defn(C, 'inherited', inherited);
  return C;
}

module.exports.const_get_qualified = const_get_qualified;
function const_get_qualified(base, path) {
  if (arguments.length == 1) {
    path = base;
    base = '::';
  }
  const parts = path.split('::');
  // special case of root anchored module -- ingore base in that case
  if (parts[0] === '') {
    parts.shift();
    base = '::';
  }

  for(let part of parts) {
    base = Opal.const_get_qualified(base, part, 'skip_raise');
    if (!base)
      break;
  }

  return base;
}
