class Route {
  constructor() {
    this._get = new Map()
    this._post = new Map()
  }

  get(path, proxy) {
    this._get.set(path, proxy)
  }

  post(path, proxy) {
    this._post.set(path, proxy)
  }
}

module.exports = Route
