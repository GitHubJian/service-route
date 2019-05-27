const ContextUtilsHelper = require('../helpers/context-utils')
const RouteParamtypesEnum = require('../../common/enums/route-paramtypes.enum')
const constants = require('../../common/constants')
const sharedUtils = require('../../common/utils/shared.utils')
const RouterResponseController = require('./router-response-controller')

class RouterExecutionContext {
  constructor(paramsFactory, interceptorsContextCreator, interceptorsConsumer) {
    this.paramsFactory = paramsFactory
    this.interceptorsContextCreator = interceptorsContextCreator
    this.interceptorsConsumer = interceptorsConsumer

    this.contextUtils = new ContextUtilsHelper()
    this.responseController = new RouterResponseController()
  }

  create(instance, callback, methodName, module, requestMethod) {
    const metadata =
      this.contextUtils.reflectCallbackMetadata(
        instance,
        methodName,
        constants.ROUTE_ARGS_METADATA
      ) || {}
    const keys = Object.keys(metadata)
    const argsLength = this.contextUtils.getArgumentsLength(keys, metadata)
    const paramtypes = this.contextUtils.reflectCallbackParamtypes(
      instance,
      methodName
    )
    const httpCode = this.reflectHttpStatusCode(callback)
    const paramsMetadata = this.exchangeKeysForValues(keys, metadata, module)
    const paramsOptions = this.contextUtils.mergeParamsMetatypes(
      paramsMetadata,
      paramtypes
    )
    const httpStatusCode = httpCode
      ? httpCode
      : this.responseController.getStatusByMethod(requestMethod)

    const fnApplyPipes = this.createPipesFn(paramsOptions)
    const fnHandleResponse = this.createHandleResponseFn(
      callback,
      httpStatusCode
    )
    const handler = (args, ctx, next) => async () => {
      fnApplyPipes && (await fnApplyPipes(args, ctx, next))
      return callback.apply(instance, args)
    }

    // route callback
    return async (ctx, next) => {
      const args = this.contextUtils.createNullArray(argsLength)
      const result = await handler(args, ctx, next)()
      await fnHandleResponse(result, ctx)
    }
  }

  createPipesFn(paramsOptions) {
    const pipesFn = async (args, ctx, next) => {
      await Promise.all(
        paramsOptions.map(async param => {
          const { index, extractValue } = param
          const value = extractValue(ctx, next)

          args[index] = await this.getParamValue(value)
        })
      )
    }

    return paramsOptions.length ? pipesFn : null
  }

  // modify value
  async getParamValue(value) {
    return Promise.resolve(value)
  }

  exchangeKeysForValues(keys, metadata) {
    return keys.map(key => {
      const { index, data } = metadata[key]

      const type = this.contextUtils.mapParamType(key)

      const numericType = Number(type)
      // callback
      const extractValue = (ctx, next) =>
        this.paramsFactory.exchangeKeyForValue(numericType, data, { ctx, next })

      return { index, extractValue, type: numericType, data }
    })
  }

  createHandleResponseFn(callback, httpStatusCode) {
    const responseHeaders = this.reflectResponseHeaders(callback)
    const hasCustomHeaders = !sharedUtils.isEmpty(responseHeaders)
    return async (result, ctx) => {
      // callback for outputStream
      hasCustomHeaders &&
        this.responseController.setHeaders(ctx, responseHeaders)
      await this.responseController.apply(result, ctx, httpStatusCode)
    }
  }

  reflectResponseHeaders(callback) {
    return Reflect.getMetadata(constants.HEADERS_METADATA, callback) || []
  }

  reflectHttpStatusCode(callback) {
    return Reflect.getMetadata(constants.HTTP_CODE_METADATA, callback)
  }
}

module.exports = RouterExecutionContext
