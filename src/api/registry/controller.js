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
 * GET /registry/{channel}/v0.1/servers
 * Returns MCP servers in the registry for the given channel.
 * Stable channel returns only stable-tagged servers; canary returns all.
 *
 * @param {import('@hapi/hapi').Request} request - Hapi request object with params: {channel}
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject}
 */
async function listServers (request, h) {
  const { channel = 'stable' } = request.params
  const servers = await service.getServers(channel)
  const registryEntries = servers.map(toRegistryEntry)

  const response = h.response({
    servers: registryEntries,
    metadata: { count: registryEntries.length }
  }).code(statusCodes.HTTP_STATUS_OK)

  return applyCorsHeaders(response)
}

/**
 * OPTIONS /registry/{channel}/v0.1/servers
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
 * GET /registry/{channel}/v0.1/servers/{serverName}/versions/latest
 * Returns the latest version of a specific server within the given channel.
 *
 * @param {import('@hapi/hapi').Request} request - Hapi request object with params: {channel, serverName}
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject}
 */
async function getServerLatest (request, h) {
  const { channel = 'stable', serverName } = request.params

  const server = await service.getServer(serverName, channel)

  if (!server) {
    return h.response({ message: 'Server not found' }).code(statusCodes.HTTP_STATUS_NOT_FOUND)
  }

  const response = h.response(toRegistryEntry(server)).code(statusCodes.HTTP_STATUS_OK)

  return applyCorsHeaders(response)
}

/**
 * GET /registry/{channel}/v0.1/servers/{serverName}/versions/{version}
 * Returns a specific version of a server within the given channel.
 *
 * @param {import('@hapi/hapi').Request} request - Hapi request object with params: {channel, serverName, version}
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject}
 */
async function getServerVersion (request, h) {
  const { channel = 'stable', serverName, version } = request.params

  const server = await service.getServerVersion(serverName, version, channel)

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
