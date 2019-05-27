const Constants = require('../common/constants')

class DependenciesScanner {
  constructor(container) {
    this.container = container
  }

  async scan(module) {
    await this.scanForModules(module)
    await this.scanModulesForDependencies()
  }

  async scanForModules(module, scope = []) {
    await this.storeModule(module, scope)
  }

  async storeModule(module, scope) {
    await this.container.addModule(module, scope)
  }

  async scanModulesForDependencies() {
    const modules = this.container.getModules()

    for (const [token, { metatype }] of modules) {
      this.reflectProviders(metatype, token)
      this.reflectControllers(metatype, token)
    }
  }

  reflectProviders(module, token) {
    const providers = [
      ...this.reflectMetadata(module, Constants.METADATA.PROVIDERS)
    ]

    providers.forEach(provider => {
      this.storeProvider(provider, token)
    })
  }

  storeProvider(provider, token) {
    return this.container.addProvider(provider, token)
  }

  reflectControllers(module, token) {
    const routes = [
      ...this.reflectMetadata(module, Constants.METADATA.CONTROLLERS)
    ]

    routes.forEach(route => {
      this.storeRoute(route, token)
    })
  }

  reflectMetadata(metatype, metadataKey) {
    return Reflect.getMetadata(metadataKey, metatype) || []
  }

  storeRoute(route, token) {
    this.container.addController(route, token)
  }
}

module.exports = DependenciesScanner
