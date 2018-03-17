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

  If the base class is not provided, defaults to `Opal.Object`.
*/
module.exports.subclass = subclass;
function subclass(base, desc) {
  if (arguments.length == 1) {
    desc = base;
    base = Opal.Object;
  }

  const C = Opal.Class.$new(base);
  inherited = {}; // the list of the original methods that where patched

  for(let [key, value] of Object.entries(desc)) {
    inherited[key] = patch(C, key, value);
  }

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
