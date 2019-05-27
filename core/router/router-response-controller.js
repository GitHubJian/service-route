const RequestMethodEnum = require('../../common/enums/request-method.enum')
const HttpStatusEnum = require('../../common/enums/http-status.enum')
const sharedUtils = require('../../common/utils/shared.utils')

class RouterResponseController {
  constructor() {}

  async apply(resultOrDeffered, ctx) {
    const result = await this.transformToResult(resultOrDeffered)
    
    return (ctx.body = { code: 0, msg: '1', body: result })
  }

  async transformToResult(resultOrDeffered) {
    return resultOrDeffered
  }

  getStatusByMethod(requestMethod) {
    switch (requestMethod) {
      case RequestMethodEnum.POST:
        return HttpStatusEnum.CREATED
      default:
        return HttpStatusEnum.OK
    }
  }
}

module.exports = RouterResponseController
