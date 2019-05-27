const Constants = require('../../constants')

const metadataKeys = [
  Constants.METADATA.CONTROLLERS,
  Constants.METADATA.PROVIDERS 
]

function validateKeys(keys) {
  const isKeyInvalid = key => metadataKeys.findIndex(k => k === key) < 0
  const validateKey = key => {
    if (!isKeyInvalid(key)) {
      return
    }

    throw new Error(key)
  }

  keys.forEach(validateKey)
}

function Module(metadata) {
  const propsKeys = Object.keys(metadata)
  validateKeys(propsKeys)

  return function(target) {
    for (const property in metadata) {
      if (metadata.hasOwnProperty(property)) {
        Reflect.defineMetadata(property, metadata[property], target)
      }
    }
  }
}

module.exports = Module
