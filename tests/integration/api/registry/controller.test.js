import { constants as statusCodes } from 'node:http2'

import { createServer } from '../../../../src/server/server.js'

describe('#registryApiController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('GET /v0.1/servers', () => {
    test('should return 200 with server list', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.servers).toBeInstanceOf(Array)
      expect(result.servers.length).toBeGreaterThan(0)
      expect(result.metadata).toMatchObject({ count: expect.any(Number) })
    })

    test('should include the GitHub MCP Server', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers'
      })

      const githubServer = result.servers.find(
        (s) => s.server.name === 'io.github.github/github-mcp-server'
      )
      expect(githubServer).toBeDefined()
      expect(githubServer.server.title).toBe('GitHub MCP Server')
    })

    test('should include the SonarQube MCP Server', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers'
      })

      const sonarServer = result.servers.find(
        (s) => s.server.name === 'com.sonarsource/sonarqube-mcp-server'
      )
      expect(sonarServer).toBeDefined()
      expect(sonarServer.server.title).toBe('SonarQube MCP Server')
    })

    test('should include CORS headers', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers'
      })

      expect(headers['access-control-allow-origin']).toBe('*')
      expect(headers['access-control-allow-methods']).toBe('GET, OPTIONS')
      expect(headers['access-control-allow-headers']).toBe('Authorization, Content-Type')
    })
  })

  describe('OPTIONS /v0.1/servers', () => {
    test('should handle CORS preflight', async () => {
      const { statusCode, headers } = await server.inject({
        method: 'OPTIONS',
        url: '/v0.1/servers'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_NO_CONTENT)
      expect(headers['access-control-allow-origin']).toBe('*')
      expect(headers['access-control-allow-methods']).toBe('GET, OPTIONS')
      expect(headers['access-control-allow-headers']).toBe('Authorization, Content-Type')
    })
  })

  describe('GET /v0.1/servers/{namespace}/{name}/versions/latest', () => {
    test('should return the latest version of a known server', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/io.github.github/github-mcp-server/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.server.name).toBe('io.github.github/github-mcp-server')
    })

    test('should include CORS headers', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/io.github.github/github-mcp-server/versions/latest'
      })

      expect(headers['access-control-allow-origin']).toBe('*')
    })

    test('should return 404 for unknown server', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/io.github.unknown/does-not-exist/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_NOT_FOUND)
    })
  })

  describe('GET /v0.1/servers/{namespace}/{name}/versions/{version}', () => {
    test('should return a specific version of a known server', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/io.github.github/github-mcp-server/versions/0.3.0'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.server.version).toBe('0.3.0')
    })

    test('should return the SonarQube MCP Server at version latest', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/com.sonarsource/sonarqube-mcp-server/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.server.name).toBe('com.sonarsource/sonarqube-mcp-server')
    })

    test('should include CORS headers', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/io.github.github/github-mcp-server/versions/0.3.0'
      })

      expect(headers['access-control-allow-origin']).toBe('*')
    })

    test('should return 404 for unknown version', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/io.github.github/github-mcp-server/versions/99.0.0'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_NOT_FOUND)
    })
  })
})
