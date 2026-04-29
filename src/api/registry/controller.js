import { statusCodes } from '../../constants/status-codes.js'
import { toRegistryEntry } from './model.js'
import * as service from './service.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type'
}

/**
 * Apply CORS headers to response
 *
 * @param {import('@hapi/hapi').ResponseObject} response - Hapi response object
 *
 * @returns {import('@hapi/hapi').ResponseObject} The response object with CORS headers applied
 */
function applyCorsHeaders (response) {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.header(key, value)
  }

  return response
}

/**
 * GET /v0.1/servers
 * Returns all approved MCP servers in the registry.
 *
 * @param {import('@hapi/hapi').Request} _request - Hapi request object
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject}
 */
async function listServers (_request, h) {
  const servers = await service.getServers()
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
 *
 * @param {import('@hapi/hapi').Request} _request - Hapi request object
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject}
 */
function optionsServers (_request, h) {
  const response = h.response().code(statusCodes.HTTP_STATUS_NO_CONTENT)
  return applyCorsHeaders(response)
}

/**
 * GET /v0.1/servers/{serverName}/versions/latest
 * Returns the latest version of a specific server.
 *
 * @param {import('@hapi/hapi').Request} request - Hapi request object with params: {serverName}
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject}
 */
async function getServerLatest (request, h) {
  const { serverName } = request.params

  const server = await service.getServer(serverName)

  if (!server) {
    return h.response({ message: 'Server not found' }).code(statusCodes.HTTP_STATUS_NOT_FOUND)
  }

  const response = h.response(toRegistryEntry(server)).code(statusCodes.HTTP_STATUS_OK)

  return applyCorsHeaders(response)
}

/**
 * GET /v0.1/servers/{serverName}/versions/{version}
 * Returns a specific version of a server.
 *
 * @param {import('@hapi/hapi').Request} request - Hapi request object with params: {serverName, version}
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject}
 */
async function getServerVersion (request, h) {
  const { serverName, version } = request.params

  const server = await service.getServerVersion(serverName, version)

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
