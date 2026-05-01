import { constants as statusCodes } from 'node:http2'

import { createServer } from '../../../../src/server/server.js'

describe('#gettingStartedController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('GET /getting-started', () => {
    test('should return 200 with correct page title', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/getting-started'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result).toEqual(expect.stringContaining('Getting started |'))
    })

    test('should render the Getting started heading', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/getting-started'
      })

      expect(result).toEqual(expect.stringContaining('Getting started'))
    })

    test('should render the GitHub Copilot integration section', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/getting-started'
      })

      expect(result).toEqual(expect.stringContaining('Using this registry with GitHub Copilot'))
      expect(result).toEqual(expect.stringContaining('mcp-allowlist-enforcement'))
    })

    test('should render the stable and canary channel endpoint paths', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/getting-started'
      })

      expect(result).toEqual(expect.stringContaining('/registry/stable/v0.1/servers'))
      expect(result).toEqual(expect.stringContaining('/registry/canary/v0.1/servers'))
    })

    test('should render the Adding a server section', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/getting-started'
      })

      expect(result).toEqual(expect.stringContaining('Adding a server to the registry'))
    })

    test('should render the Getting started nav link as active', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/getting-started'
      })

      expect(result).toEqual(expect.stringContaining('aria-current="page"'))
    })
  })
})
