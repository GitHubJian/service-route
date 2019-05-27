const Iterate = require('iterare')
const SharedUtils = require('../common/utils/shared.utils')

class MetadataScanner {
  scanFromPrototype(instance, prototype, callback) {
    let iterate = Iterate.default([
      ...this.getAllFilteredMethodNames(prototype)
    ])
      .map(callback)
      .filter(metadata => !SharedUtils.isNil(metadata))
      .toArray()

    return iterate
  }

  *getAllFilteredMethodNames(prototype) {
    do {
      yield* Iterate.default(Object.getOwnPropertyNames(prototype))
        .filter(prop => {
          const descriptor = Object.getOwnPropertyDescriptor(prototype, prop)
          if (descriptor.set || descriptor.get) {
            return false
          }

          return (
            !SharedUtils.isConstructor(prop) &&
            SharedUtils.isFunction(prototype[prop])
          )
        })
        .toArray()
    } while (
      (prototype = Reflect.getPrototypeOf(prototype)) &&
      prototype !== Object.prototype
    )
  }
}

module.exports = MetadataScanner
