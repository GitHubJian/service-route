const SharedUtils = require('../common/utils/shared.utils')
const RoutesResolver = require('./router/routes-resolver')
const Routes = require('./router/routes')

class Router {
  constructor(container) {
    this.container = container
    this.routeInstance = new Routes()

    this.routesResolver = new RoutesResolver(this.container)
  }

  async registerRouter() {
    const prefix = ''
    const basePath = SharedUtils.validatePath(prefix)
    this.routesResolver.resolve(this.routeInstance, basePath)
  }
}

module.exports = Router
