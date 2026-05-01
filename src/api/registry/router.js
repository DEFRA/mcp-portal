import Joi from 'joi'

import * as registryController from './controller.js'

const channelParamValidation = {
  options: {
    validate: {
      params: Joi.object({
        channel: Joi.string().valid('stable', 'canary').required()
      }).unknown(true)
    }
  }
}

const routes = [
  {
    method: 'GET',
    path: '/registry/{channel}/v0.1/servers',
    handler: registryController.listServers,
    ...channelParamValidation
  },
  {
    method: 'OPTIONS',
    path: '/registry/{channel}/v0.1/servers',
    handler: registryController.optionsServers
  },
  {
    method: 'GET',
    path: '/registry/{channel}/v0.1/servers/{serverName}/versions/latest',
    handler: registryController.getServerLatest,
    ...channelParamValidation
  },
  {
    method: 'OPTIONS',
    path: '/registry/{channel}/v0.1/servers/{serverName}/versions/latest',
    handler: registryController.optionsServers
  },
  {
    method: 'GET',
    path: '/registry/{channel}/v0.1/servers/{serverName}/versions/{version}',
    handler: registryController.getServerVersion,
    ...channelParamValidation
  },
  {
    method: 'OPTIONS',
    path: '/registry/{channel}/v0.1/servers/{serverName}/versions/{version}',
    handler: registryController.optionsServers
  },
  // Default alias routes — no {channel} param; controllers default to 'stable'
  {
    method: 'GET',
    path: '/registry/v0.1/servers',
    handler: registryController.listServers
  },
  {
    method: 'OPTIONS',
    path: '/registry/v0.1/servers',
    handler: registryController.optionsServers
  },
  {
    method: 'GET',
    path: '/registry/v0.1/servers/{serverName}/versions/latest',
    handler: registryController.getServerLatest
  },
  {
    method: 'OPTIONS',
    path: '/registry/v0.1/servers/{serverName}/versions/latest',
    handler: registryController.optionsServers
  },
  {
    method: 'GET',
    path: '/registry/v0.1/servers/{serverName}/versions/{version}',
    handler: registryController.getServerVersion
  },
  {
    method: 'OPTIONS',
    path: '/registry/v0.1/servers/{serverName}/versions/{version}',
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
