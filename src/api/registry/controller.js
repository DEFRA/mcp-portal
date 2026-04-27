import { createRequire } from 'node:module'
import path from 'node:path'
import url from 'node:url'

import { statusCodes } from '../../constants/status-codes.js'
import { toRegistryEntry } from './model.js'

const require = createRequire(import.meta.url)
const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const servers = require(path.resolve(dirname, '../../data/mcp-servers.json'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type'
}

function applyCorsHeaders (response) {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.header(key, value)
  }
  return response
}

/**
 * GET /v0.1/servers
 * Returns all approved MCP servers in the registry.
 */
function listServers (_request, h) {
  const registryEntries = servers.map(toRegistryEntry)

  const response = h.response({
    servers: registryEntries,
    metadata: { count: registryEntries.length }
  }).code(statusCodes.HTTP_STATUS_OK)

  return applyCorsHeaders(response)
}

/**
 * OPTIONS /v0.1/servers
 * CORS preflight handler.
 */
function optionsServers (_request, h) {
  const response = h.response(null).code(statusCodes.HTTP_STATUS_NO_CONTENT)
  return applyCorsHeaders(response)
}

/**
 * GET /v0.1/servers/{namespace}/{name}/versions/latest
 * Returns the latest version of a specific server.
 */
function getServerLatest (request, h) {
  const { namespace, name } = request.params
  const qualifiedName = `${namespace}/${name}`

  const server = servers.find((s) => s.id === qualifiedName)

  if (!server) {
    return h.response({ message: 'Server not found' }).code(statusCodes.HTTP_STATUS_NOT_FOUND)
  }

  const response = h.response(toRegistryEntry(server)).code(statusCodes.HTTP_STATUS_OK)
  return applyCorsHeaders(response)
}

/**
 * GET /v0.1/servers/{namespace}/{name}/versions/{version}
 * Returns a specific version of a server.
 */
function getServerVersion (request, h) {
  const { namespace, name, version } = request.params
  const qualifiedName = `${namespace}/${name}`

  const server = servers.find(
    (s) => s.id === qualifiedName && s.version === version
  )

  if (!server) {
    return h.response({ message: 'Server version not found' }).code(statusCodes.HTTP_STATUS_NOT_FOUND)
  }

  const response = h.response(toRegistryEntry(server)).code(statusCodes.HTTP_STATUS_OK)
  return applyCorsHeaders(response)
}

export {
  listServers,
  optionsServers,
  getServerLatest,
  getServerVersion
}
