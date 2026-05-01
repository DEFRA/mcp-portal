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

  describe('GET /registry/canary/v0.1/servers', () => {
    test('should return 200 with all servers', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.servers).toBeInstanceOf(Array)
      expect(result.servers.length).toBeGreaterThan(0)
      expect(result.metadata).toMatchObject({ count: expect.any(Number) })
    })

    test('should include both stable and canary servers', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers'
      })

      const names = result.servers.map((s) => s.server.name)
      expect(names).toContain('com.example/test-stdio-server')
      expect(names).toContain('com.example/test-http-server')
    })

    test('should include CORS headers', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers'
      })

      expect(headers['access-control-allow-origin']).toBe('*')
      expect(headers['access-control-allow-methods']).toBe('GET, OPTIONS')
      expect(headers['access-control-allow-headers']).toBe('Authorization, Content-Type')
    })
  })

  describe('GET /registry/stable/v0.1/servers', () => {
    test('should return 200 with only stable servers', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/registry/stable/v0.1/servers'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.servers).toBeInstanceOf(Array)
    })

    test('should include only stable-tagged servers', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/registry/stable/v0.1/servers'
      })

      const names = result.servers.map((s) => s.server.name)
      expect(names).toContain('com.example/test-stdio-server')
      expect(names).not.toContain('com.example/test-http-server')
    })

    test('should include CORS headers', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: '/registry/stable/v0.1/servers'
      })

      expect(headers['access-control-allow-origin']).toBe('*')
      expect(headers['access-control-allow-methods']).toBe('GET, OPTIONS')
      expect(headers['access-control-allow-headers']).toBe('Authorization, Content-Type')
    })
  })

  describe('GET /registry/v0.1/servers (default alias)', () => {
    test('should behave like stable and return only stable servers', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/registry/v0.1/servers'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      const names = result.servers.map((s) => s.server.name)
      expect(names).toContain('com.example/test-stdio-server')
      expect(names).not.toContain('com.example/test-http-server')
    })
  })

  describe('OPTIONS /registry/canary/v0.1/servers', () => {
    test('should handle CORS preflight', async () => {
      const { statusCode, headers } = await server.inject({
        method: 'OPTIONS',
        url: '/registry/canary/v0.1/servers'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_NO_CONTENT)
      expect(headers['access-control-allow-origin']).toBe('*')
      expect(headers['access-control-allow-methods']).toBe('GET, OPTIONS')
      expect(headers['access-control-allow-headers']).toBe('Authorization, Content-Type')
    })
  })

  describe('GET /registry/canary/v0.1/servers/{serverName}/versions/latest', () => {
    test('should return the latest version of a known server', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers/com.example%2Ftest-stdio-server/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.server.name).toBe('com.example/test-stdio-server')
    })

    test('should include CORS headers', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers/com.example%2Ftest-stdio-server/versions/latest'
      })

      expect(headers['access-control-allow-origin']).toBe('*')
    })

    test('should return 404 for unknown server', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers/com.example%2Fdoes-not-exist/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_NOT_FOUND)
    })

    test('should return 404 for canary-only server on stable channel', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/registry/stable/v0.1/servers/com.example%2Ftest-http-server/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_NOT_FOUND)
    })
  })

  describe('GET /registry/canary/v0.1/servers/{serverName}/versions/{version}', () => {
    test('should return a specific version of a known server', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers/com.example%2Ftest-stdio-server/versions/1.0.0'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.server.version).toBe('1.0.0')
    })

    test('should return the http test server at version latest on canary', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers/com.example%2Ftest-http-server/versions/latest'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result.server.name).toBe('com.example/test-http-server')
    })

    test('should include CORS headers', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers/com.example%2Ftest-stdio-server/versions/1.0.0'
      })

      expect(headers['access-control-allow-origin']).toBe('*')
    })

    test('should return 404 for unknown version', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/registry/canary/v0.1/servers/com.example%2Ftest-stdio-server/versions/99.0.0'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_NOT_FOUND)
    })
  })
})
