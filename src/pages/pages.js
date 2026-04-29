import { registryRouter } from './registry/router.js'

const pageRouter = {
  plugin: {
    name: 'pageRouter',
    async register (server) {
      await server.register([
        registryRouter
      ])
    }
  }
}

export {
  pageRouter
}
