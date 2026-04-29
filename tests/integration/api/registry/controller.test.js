import { constants as statusCodes } from 'node:http2'
import { vi } from 'vitest'

import { createServer } from '../../../../src/server/server.js'
import fixture from '../../../fixtures/mcp-servers.json'

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    readFile: vi.fn((path, encoding) => {
      if (typeof path === 'string' && path.endsWith('mcp-servers.json')) {
        return Promise.resolve(JSON.stringify(fixture))
      }
      return actual.readFile(path, encoding)
    })
  }
})

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

    test('should include the stdio test server', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers'
      })

      const stdioServer = result.servers.find(
        (s) => s.server.name === 'com.example/test-stdio-server'
      )
      expect(stdioServer).toBeDefined()
      expect(stdioServer.server.title).toBe('Test Stdio Server')
    })

    test('should include the http test server', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers'
      })

      const httpServer = result.servers.find(
        (s) => s.server.name === 'com.example/test-http-server'
      )
      expect(httpServer).toBeDefined()
      expect(httpServer.server.title).toBe('Test HTTP Server')
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

  describe('GET /v0.1/servers/{serverName}/versions/latest', () => {
    test('should return the latest version of a known server', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/com.example%2Ftest-stdio-server/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.server.name).toBe('com.example/test-stdio-server')
    })

    test('should include CORS headers', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/com.example%2Ftest-stdio-server/versions/latest'
      })

      expect(headers['access-control-allow-origin']).toBe('*')
    })

    test('should return 404 for unknown server', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/com.example%2Fdoes-not-exist/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_NOT_FOUND)
    })
  })

  describe('GET /v0.1/servers/{serverName}/versions/{version}', () => {
    test('should return a specific version of a known server', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/com.example%2Ftest-stdio-server/versions/1.0.0'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.server.version).toBe('1.0.0')
    })

    test('should return the http test server at version latest', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/com.example%2Ftest-http-server/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.server.name).toBe('com.example/test-http-server')
    })

    test('should include CORS headers', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/com.example%2Ftest-stdio-server/versions/1.0.0'
      })

      expect(headers['access-control-allow-origin']).toBe('*')
    })

    test('should return 404 for unknown version', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/v0.1/servers/com.example%2Ftest-stdio-server/versions/99.0.0'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_NOT_FOUND)
    })
  })
})
