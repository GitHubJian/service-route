const Injector = require('./injector')

class InstanceLoader {
  constructor(container) {
    this.container = container
    this.injector = new Injector()
  }

  async createInstancesOfDependencies() {
    const modules = this.container.getModules()
    this.createPrototypes(modules)
    await this.createInstances(modules)
  }

  createPrototypes(modules) {
    modules.forEach(module => {
      this.createPrototypesOfProviders(module)
      this.createPrototypesOfRoutes(module)
    })
  }

  createPrototypesOfProviders(module) {
    module.providers.forEach(wrapper => {
      this.injector.loadPrototypeOfInstance(wrapper, module.providers)
    })
  }

  createPrototypesOfRoutes(module) {
    module.routes.forEach(wrapper => {
      this.injector.loadPrototypeOfInstance(wrapper, module.routes)
    })
  }

  async createInstances(modules) {
    await Promise.all(
      [...modules.values()].map(async module => {
        await this.createInstancesOfProviders(module)
        await this.createInstancesOfRoutes(module)

        const { name } = module.metatype

        console.log(`${name} dependencies initialized`)
      })
    )
  }

  async createInstancesOfProviders(module) {
    await Promise.all(
      [...module.providers.values()].map(
        async wrapper =>
          await this.injector.loadInstanceOfProvider(wrapper, module)
      )
    )
  }

  async createInstancesOfRoutes(module) {
    await Promise.all(
      [...module.routes.values()].map(async wrapper => {
        await this.injector.loadInstanceOfRoute(wrapper, module)
      })
    )
  }
}

module.exports = InstanceLoader
