const SharedUtils = require('../../common/utils/shared.utils')
const Constants = require('../../common/constants')

class Injector {
  loadPrototypeOfInstance({ metatype, name }, collection) {
    if (!collection) {
      return null
    }

    const target = collection.get(name)
    if (
      target.isResolved ||
      !SharedUtils.isNil(target.inject) ||
      !metatype.prototype
    ) {
      return null
    }

    collection.set(
      name,
      Object.assign({}, collection.get(name), {
        instance: Object.create(metatype.prototype)
      })
    )
  }

  async loadInstanceOfProvider(wrapper, module) {
    const providers = module.providers
    await this.loadInstance(wrapper, providers, module)
  }

  async loadInstanceOfRoute(wrapper, module) {
    const routes = module.routes

    await this.loadInstance(wrapper, routes, module)
  }

  async loadInstance(wrapper, collection, module) {
    if (wrapper.isPending) {
      return wrapper.done$
    }

    const done = this.applyDoneHook(wrapper)
    const { name, inject } = wrapper
    const targetWrapper = collection.get(name)

    if (SharedUtils.isUndefined(targetWrapper)) {
      throw new Error(`RunTime Error`)
    }

    if (targetWrapper.isResolved) {
      return
    }

    const callback = async instances => {
      const properties = await this.resolveProperties(wrapper, module, inject)
      const instance = await this.instantiateClass(
        instances,
        wrapper,
        targetWrapper
      )

      this.applyProperties(instance, properties)

      done()
    }

    await this.resolveConstructorParams(wrapper, module, inject, callback)
  }

  async resolveConstructorParams(wrapper, module, inject, callback) {
    const dependencies = SharedUtils.isNil(inject)
      ? this.reflectConstructorParams(wrapper.metatype)
      : inject

    let isResolved = true
    const instances = await Promise.all(
      dependencies.map(async (param, index) => {
        try {
          const paramWrapper = await this.resolveSingleParam(
            wrapper,
            param,
            { index, dependencies },
            module
          )
          if (!paramWrapper.isResolved) {
            isResolved = false
          }

          return paramWrapper.instance
        } catch (err) {
          console.error(err)
          console.error(err.stack)

          return undefined
        }
      })
    )

    isResolved && (await callback(instances))
  }

  reflectConstructorParams(type) {
    const paramtypes =
      Reflect.getMetadata(Constants.PARAMTYPES_METADATA, type) || []
    const selfParams = this.reflectSelfParams(type)
    selfParams.forEach(({ index, param }) => (paramtypes[index] = param))

    return paramtypes
  }

  reflectSelfParams(type) {
    return (
      Reflect.getMetadata(Constants.SELF_DECLARED_DEPS_METADATA, type) || []
    )
  }

  async resolveProperties(wrapper, module, inject) {
    if (!SharedUtils.isNil(inject)) {
      return []
    }

    const properties = this.reflectProperties(wrapper.metatype)
    const instances = await Promise.all(
      properties.map(async item => {
        try {
          const dependencyContext = {
            key: item.key,
            name: item.name
          }

          const paramWrapper = await this.resolveSingleParam(
            wrapper,
            item.name,
            dependencyContext,
            module
          )

          return (paramWrapper && paramWrapper.instance) || undefined
        } catch (err) {
          return undefined
        }
      })
    )

    return properties.map((item, index) =>
      Object.assign({}, item, { instance: instances[index] })
    )
  }

  async resolveSingleParam(wrapper, param, dependencyContext, module) {
    if (SharedUtils.isUndefined(param)) {
      throw new Error(`Not Found Dependency`)
    }

    const token = this.resolveParamToken(wrapper, param)

    let instance = await this.resolveProviderInstance(
      module,
      SharedUtils.isFunction(token) ? token.name : token,
      dependencyContext,
      wrapper
    )

    return instance
  }

  async resolveProviderInstance(module, name, dependencyContext, wrapper) {
    const providers = module.providers

    const instanceWrapper = await this.lookupProvider(
      providers,
      Object.assign({}, dependencyContext, { name })
    )

    return instanceWrapper
  }

  async lookupProvider(providers, dependencyContext) {
    const { name } = dependencyContext

    return providers.get(name)
  }

  resolveParamToken(wrapper, param) {
    return param
  }

  reflectProperties(type) {
    const properties =
      Reflect.getMetadata(Constants.PROPERTY_DEPS_METADATA, type) || []

    return properties.map(item =>
      Object.assign({}, item, {
        name: item.type
      })
    )
  }

  applyDoneHook(wrapper) {
    let done
    wrapper.done$ = new Promise((resolve, reject) => {
      done = resolve
    })
    wrapper.isPending = true

    return done
  }

  applyProperties(instance, properties) {
    if (!SharedUtils.isObject(instance)) {
      return undefined
    }

    properties
      .filter(item => !SharedUtils.isNil(item.instance))
      .forEach(item => (instance[item.key] = item.instance))
  }

  async instantiateClass(instances, wrapper, targetMetatype) {
    const { metatype } = wrapper
    targetMetatype.instance = new metatype(...instances)

    targetMetatype.isResolved = true

    return targetMetatype.instance
  }
}

module.exports = Injector
