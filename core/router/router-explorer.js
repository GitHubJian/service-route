const RouterMethodFactory = require('../helpers/router-method-factory')
const Constants = require('../../common/constants')
const SharedUtils = require('../../common/utils/shared.utils')
const RouteParamsFactory = require('./route-params-factory')
const RouterExecutionContext = require('./router-execution-context')
const InterceptorsContextCreator = require('../interceptors/interceptors-context-creator')
const InterceptorsConsumer = require('../interceptors/interceptors-consumer')

class RouterExplorer {
  constructor(metadataScanner, container, routerProxy) {
    this.metadataScanner = metadataScanner
    this.container = container
    this.routerProxy = routerProxy

    this.routerMethodFactory = new RouterMethodFactory()
    this.executionContextCreator = new RouterExecutionContext(
      new RouteParamsFactory(),
      new InterceptorsContextCreator(),
      new InterceptorsConsumer()
    )
  }

  extractRouterPath(metatype, prefix) {
    let path = Reflect.getMetadata(Constants.PATH_METADATA, metatype)
    if (prefix) path = prefix + this.validateRoutePath(path)

    return this.validateRoutePath(path)
  }

  validateRoutePath(path) {
    if (SharedUtils.isUndefined(path)) {
      throw new Error(`Unknown Request Exception`)
    }

    return SharedUtils.validatePath(path)
  }

  explore(instance, metatype, module, appInstance, basePath) {
    const routerPaths = this.scanForPaths(instance)

    this.applyPathsToRouterProxy(
      appInstance,
      routerPaths,
      instance,
      module,
      basePath
    )
  }

  applyPathsToRouterProxy(router, routePaths, instance, module, basePath) {
    ;(routePaths || []).forEach(pathProperties => {
      const { path, requestMethod } = pathProperties

      this.applyCallbackToRouter(
        router,
        pathProperties,
        instance,
        module,
        basePath
      )

      path.forEach(p => {
        return console.log(`Mapped {${path}, ${requestMethod}} route`)
      })
    })
  }

  applyCallbackToRouter(router, pathProperties, instance, module, basePath) {
    const {
      path: paths,
      requestMethod,
      targetCallback,
      methodName
    } = pathProperties

    const routerMethod = this.routerMethodFactory
      .get(router, requestMethod)
      .bind(router)

    const proxy = this.createCallbackProxy(
      instance,
      targetCallback,
      methodName,
      module,
      requestMethod
    )

    const stripSlash = str =>
      str[str.length - 1] === '/' ? str.slice(0, str.length - 1) : str

    paths.forEach(path => {
      const fullPath = stripSlash(basePath) + path
      routerMethod(stripSlash(fullPath) || '/', proxy)
    })
  }

  createCallbackProxy(instance, callback, methodName, module, requestMethod) {
    const executionContext = this.executionContextCreator.create(
      instance,
      callback,
      methodName,
      module,
      requestMethod
    )

    return this.routerProxy.createProxy(executionContext)
  }

  scanForPaths(instance, prototype) {
    const instancePrototype = SharedUtils.isUndefined(prototype)
      ? Object.getPrototypeOf(instance)
      : prototype

    return this.metadataScanner.scanFromPrototype(
      instance,
      instancePrototype,
      method => this.exploreMethodMetadata(instance, instancePrototype, method)
    )
  }

  exploreMethodMetadata(instance, instancePrototype, methodName) {
    const targetCallback = instancePrototype[methodName]
    const routePath = Reflect.getMetadata(
      Constants.PATH_METADATA,
      targetCallback
    )

    if (SharedUtils.isUndefined(routePath)) {
      return null
    }

    const requestMethod = Reflect.getMetadata(
      Constants.METHOD_METADATA,
      targetCallback
    )
    const path = SharedUtils.isString(routePath)
      ? [this.validateRoutePath(routePath)]
      : routePath.map(p => this.validateRoutePath(p))

    return {
      path,
      requestMethod,
      targetCallback,
      methodName
    }
  }
}

module.exports = RouterExplorer
