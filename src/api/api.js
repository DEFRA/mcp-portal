import { registryApiRouter } from './registry/router.js'

const apiRouter = {
  plugin: {
    name: 'apiRouter',
    async register (server) {
      await server.register([
        registryApiRouter
      ])
    }
  }
}

export {
  apiRouter
}
