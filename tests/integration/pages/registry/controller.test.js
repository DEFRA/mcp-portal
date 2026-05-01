import { constants as statusCodes } from 'node:http2'
import { vi } from 'vitest'

import { createServer } from '../../../../src/server/server.js'
import fixture from '../../../fixtures/mcp-servers.json'

// Mock the registry service to use the fixture data
vi.mock('../../../../src/api/registry/service.js', () => ({
  getServers: vi.fn(() => fixture),
  getServer: vi.fn((id) => fixture.find((s) => s.id === id)),
  getServerVersion: vi.fn((id, version) => fixture.find((s) => s.id === id && s.version === version))
}))

describe('#registryController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('GET / (no filter)', () => {
    test('should provide expected response', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/'
      })

      expect(result).toEqual(expect.stringContaining('Home |'))
      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
    })

    test('should render the Defra MCP Registry heading', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/'
      })

      expect(result).toEqual(expect.stringContaining('Defra MCP Registry'))
    })

    test('should render both server cards by default', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/'
      })

      expect(result).toEqual(expect.stringContaining('Test Stdio Server'))
      expect(result).toEqual(expect.stringContaining('Test HTTP Server'))
    })

    test('should render the About this registry section', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/'
      })

      expect(result).toEqual(expect.stringContaining('About this registry'))
    })

    test('should render channel filter controls', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: '/'
      })

      expect(result).toEqual(expect.stringContaining('?channel=stable'))
      expect(result).toEqual(expect.stringContaining('?channel=canary'))
    })
  })

  describe('GET /?channel=stable', () => {
    test('should render only stable-tagged server cards', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/?channel=stable'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result).toEqual(expect.stringContaining('Test Stdio Server'))
      expect(result).not.toEqual(expect.stringContaining('Test HTTP Server'))
    })
  })

  describe('GET /?channel=canary', () => {
    test('should render only canary-tagged server cards', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/?channel=canary'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result).toEqual(expect.stringContaining('Test HTTP Server'))
      expect(result).not.toEqual(expect.stringContaining('Test Stdio Server'))
    })
  })

  describe('GET /?channel=all', () => {
    test('should render all server cards', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/?channel=all'
      })

      expect(statusCode).toBe(statusCodes.HTTP_STATUS_OK)
      expect(result).toEqual(expect.stringContaining('Test Stdio Server'))
      expect(result).toEqual(expect.stringContaining('Test HTTP Server'))
    })
  })
})
