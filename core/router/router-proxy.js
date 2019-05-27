class RouterProxy {
  createProxy(targetCallback, exceptionsHandler) {
    return async (ctx, next) => {
      try {
        await targetCallback(ctx, next)
      } catch (err) {
        console.error(err)
      }
    }
  }
}

module.exports = RouterProxy
