/*
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

module.exports.subclass = subclass;
function subclass(base, desc) {
  const C = Opal.Class.$new(base);
  inherited = {}; // the list of the original methods that where patched

  for(let [key, value] of Object.entries(desc)) {
    inherited[key] = patch(C, key, value);
  }

  Opal.defn(C, 'inherited', inherited);
  return C;
}
