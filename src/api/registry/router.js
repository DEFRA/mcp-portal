import * as registryController from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/v0.1/servers',
    handler: registryController.listServers
  },
  {
    method: 'OPTIONS',
    path: '/v0.1/servers',
    handler: registryController.optionsServers
  },
  {
    method: 'GET',
    path: '/v0.1/servers/{serverName}/versions/latest',
    handler: registryController.getServerLatest
  },
  {
    method: 'OPTIONS',
    path: '/v0.1/servers/{serverName}/versions/latest',
    handler: registryController.optionsServers
  },
  {
    method: 'GET',
    path: '/v0.1/servers/{serverName}/versions/{version}',
    handler: registryController.getServerVersion
  },
  {
    method: 'OPTIONS',
    path: '/v0.1/servers/{serverName}/versions/{version}',
    handler: registryController.optionsServers
  }
]

const registryApiRouter = {
  plugin: {
    name: 'registryApiRouter',
    register (server) {
      server.route(routes)
    }
  }
}

export {
  registryApiRouter
}
