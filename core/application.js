const SharedUtils = require('../common/utils/shared.utils')
const RoutesResolver = require('./router/routes-resolver')

class Application {
  constructor(container) {
    this.container = container

    this.routesResolver = new RoutesResolver(this.container)
  }

  async init() {
    await this.registerRouter()
  }

  async registerRouter() {
    const prefix = this.config.getGlobalPrefix()
    const basePath = SharedUtils.validatePath(prefix)
    this.routesResolver.resolve(basePath)
  }
}
