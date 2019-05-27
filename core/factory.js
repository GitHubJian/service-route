const Container = require('./injector/container')
const InstanceLoader = require('./injector/instance-loader')
const Scanner = require('./scanner')
const Router = require('./router')

class FactoryStatic {
  constructor() {}

  async create(module) {
    const container = new Container()
    await this.initialize(module, container)
    const router = new Router(container)
    await router.registerRouter()

    return router.routeInstance
  }

  async initialize(module, container) {
    try {
      const instanceLoader = new InstanceLoader(container)
      const dependenciesScanner = new Scanner(container)
      await dependenciesScanner.scan(module)
      await instanceLoader.createInstancesOfDependencies()
    } catch (err) {
      console.error(err)
      console.error(err.stack)
      process.abort()
    }
  }
}

module.exports = {
  FactoryStatic,
  Factory: new FactoryStatic()
}
