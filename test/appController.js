const Inject = require('../common/decorators/core/inject.decorator')
const Controller = require('../common/decorators/core/controller.decorator')
const Dependencies = require('../common/decorators/core/dependencies.decorator')
const { Get } = require('../common/decorators/http/request-mapping.descorator')
const { Param } = require('../common/decorators/http/route-params.decorator')

@Controller('hello')
@Dependencies('AppService')
class AppController {
  @Inject('AppService')
  appService

  @Get('/:id')
  @Param('id', 0)
  getHello(id,) {
    return this.appService.getHello(id)
  }
}

module.exports = AppController
