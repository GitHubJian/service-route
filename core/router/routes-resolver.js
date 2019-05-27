const RouterExplorer = require('./router-explorer')
const Constants = require('../../common/constants')
const MetadataScanner = require('../metadata-scanner')
const RouterProxy = require('./router-proxy')

class RoutesResolver {
  constructor(container) {
    this.container = container
    this.routerProxy = new RouterProxy()

    this.routerBuilder = new RouterExplorer(
      new MetadataScanner(),
      this.container,
      this.routerProxy
    )
  }

  resolve(appInstance, basePath) {
    const modules = this.container.getModules()
    modules.forEach(({ routes, metatype }, moduleName) => {
      let path = metatype
        ? Reflect.getMetadata(Constants.MODULE_PATH, metatype)
        : undefined
      path = path ? path + basePath : basePath

      this.registerRouters(routes, moduleName, path, appInstance)
    })
  }

  registerRouters(routes, moduleName, basePath, appInstance) {
    routes.forEach(({ instance, metatype }) => {
      const path = this.routerBuilder.extractRouterPath(metatype, basePath)

      this.routerBuilder.explore(
        instance,
        metatype,
        moduleName,
        appInstance,
        path
      )
    })
  }
}

module.exports = RoutesResolver
