import * as registryController from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: registryController.getRegistry
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
