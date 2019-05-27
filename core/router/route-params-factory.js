const RouteParamtypes = require('../../common/enums/route-paramtypes.enum')

class RouteParamsFactory {
  exchangeKeyForValue(key, data, { ctx, next }) {
    switch (key) {
      case RouteParamtypes.BODY:
        return data && ctx.req.body ? ctx.req.body[data] : ctx.req.body
      case RouteParamtypes.PARAM:
        return data ? ctx.params[data] : ctx.params
      case RouteParamtypes.QUERY:
        return data ? ctx.query[data] : ctx.query
      case RouteParamtypes.HEADERS:
        return data ? ctx.headers[data] : ctx.headers
    }
  }
}

module.exports = RouteParamsFactory
