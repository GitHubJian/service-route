class InterceptorsConsumer {
  async intercept(next) {
    return await next()
  }
}

module.exports = InterceptorsConsumer
