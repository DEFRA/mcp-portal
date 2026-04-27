import { router as healthRouter } from '../../health-probe/router.js'
import { apiRouter } from '../../api/api.js'
import { pageRouter } from '../../pages/pages.js'

const router = {
  plugin: {
    name: 'router',
    async register (server) {
      await server.register([
        healthRouter,
        apiRouter,
        pageRouter
      ])
    }
  }
}

export {
  router
}
