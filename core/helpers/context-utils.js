const Constants = require('../../common/constants')

class ContextUtils {
  reflectCallbackMetadata(instance, methodName, metadataKey) {
    return Reflect.getMetadata(metadataKey, instance.constructor, methodName)
  }

  getArgumentsLength(keys, metadata) {
    return Math.max(...keys.map(key => metadata[key].index)) + 1
  }

  createNullArray(length) {
    return Array.apply(null, { length }).fill(undefined)
  }

  reflectCallbackParamtypes(instance, methodName) {
    return Reflect.getMetadata(
      Constants.PARAMTYPES_METADATA,
      instance,
      methodName
    )
  }

  mergeParamsMetatypes(paramsProperties, paramtypes) {
    if (!paramtypes) {
      return paramsProperties
    }

    return paramsProperties.map(param =>
      Object.assign({}, param, { metatype: paramtypes[param.index] })
    )
  }

  mapParamType(key) {
    const keyPair = key.split(':')
    return keyPair[0]
  }
}

module.exports = ContextUtils
