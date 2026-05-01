import * as gettingStartedController from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/getting-started',
    handler: gettingStartedController.getGettingStarted
  }
]

const gettingStartedRouter = {
  plugin: {
    name: 'gettingStartedRouter',
    register (server) {
      server.route(routes)
    }
  }
}

export {
  gettingStartedRouter
}
