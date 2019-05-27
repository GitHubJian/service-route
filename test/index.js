require('reflect-metadata')
require('@babel/register')({
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ]
})

const AppModule = require('./appModule')
const { Factory } = require('../core/factory')

const Koa = require('koa')
const KoaRouter = require('koa-router')

async function bootstrap() {
  let routerInstance = await Factory.create(AppModule)

  let app = new Koa()
  let router = new KoaRouter()

  ;[...routerInstance._get.entries()].forEach(([path, callback]) => {
    router.get(path, callback)
    console.log('path :', path);
  })

  app.use(router.routes()).use(router.allowedMethods())

  app.listen(8420, () => {
    console.log(`✨ Sever start on http://127.0.0.1:${8420}`)
  })
}

bootstrap()
