class Module {
  constructor(_metatype, _scope, container) {
    this._metatype = _metatype
    this._scope = _scope
    this.container = container

    this._providers = new Map()
    this._routes = new Map()
    this._components
  }

  get metatype() {
    return this._metatype
  }

  get providers() {
    return this._providers
  }

  addProvider(provider) {
    this._providers.set(provider.name, {
      name: provider.name,
      metatype: provider,
      instance: null,
      isResolved: false
    })

    return provider.name
  }

  get routes() {
    return this._routes
  }

  addRoute(route) {
    this._routes.set(route.name, {
      name: route.name,
      metatype: route,
      instance: null,
      isResolved: false
    })
  }
}

module.exports = Module
