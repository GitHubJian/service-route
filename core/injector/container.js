const ModuleCompiler = require('./compiler')
const Module = require('./module')

class Container {
  constructor() {
    this.moduleCompiler = new ModuleCompiler()
    this.modules = new Map()
  }

  async addModule(metatype, scope) {
    const { type, token } = await this.moduleCompiler.compile(metatype, scope)
    if (this.modules.has(token)) {
      return
    }

    const module = new Module(type, scope, this)
    this.modules.set(token, module)
  }

  addController(controller, token) {
    const module = this.modules.get(token)
    module.addRoute(controller)
  }

  getModules() {
    return this.modules
  }

  addProvider(provider, token) {
    const module = this.modules.get(token)

    return module.addProvider(provider)
  }
}

module.exports = Container
