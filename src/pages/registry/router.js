import Joi from 'joi'

import * as registryController from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: registryController.getRegistry,
    options: {
      validate: {
        query: Joi.object({
          channel: Joi.string().valid('all', 'stable', 'canary').default('all')
        })
      }
    }
  }
]

const registryRouter = {
  plugin: {
    name: 'registryRouter',
    register (server) {
      server.route(routes)
    }
  }
}

export {
  registryRouter
}
