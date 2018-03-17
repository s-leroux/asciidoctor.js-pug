/*
  The 'patch' methods allows to dynamically override a method
  from an Opal object.

  The replaced method is returned.
*/
module.exports.patch = function patch(klass, name, fn) {
  const inherited = klass.$$proto[name];

  Opal.defn(klass, name, fn);
  return inherited;
}
