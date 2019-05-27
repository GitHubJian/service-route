const Module = require('../common/decorators/modules/module.decorator')

const AppService = require('./appService')
const AppController = require('./appController')

@Module({
  providers: [AppService],
  controllers: [AppController]
})
class AppModule {}

module.exports = AppModule
