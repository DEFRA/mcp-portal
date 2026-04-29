import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import Joi from 'joi'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * @typedef {object} McpServer
 * @property {string} id - Qualified name used as the registry identifier (namespace/name)
 * @property {string} title
 * @property {string} description
 * @property {string} version
 * @property {string} websiteUrl
 * @property {object} [repository]
 * @property {object[]} transports
 * @property {string} status - 'active' | 'deprecated' | 'inactive'
 * @property {string} publishedAt
 * @property {string} updatedAt
 */

const serverSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  version: Joi.string().required(),
  websiteUrl: Joi.string().uri().required(),
  repository: Joi.object().optional(),
  transports: Joi.array().items(Joi.object()).min(1).required(),
  status: Joi.string().valid('active', 'deprecated', 'inactive').required(),
  publishedAt: Joi.string().isoDate().required(),
  updatedAt: Joi.string().isoDate().required()
})

const serversSchema = Joi.array().items(serverSchema).min(1).required()

let cachedServers = null

/**
 * Load and validate MCP servers from the data file.
 * Results are cached after the first load.
 *
 * @returns {Promise<McpServer[]>} Array of validated server objects
 * @throws {Error} If validation fails or file cannot be read
 */
async function _loadServers () {
  if (cachedServers !== null) {
    return cachedServers
  }

  const dataPath = join(__dirname, '../../data/mcp-servers.json')
  const rawData = await readFile(dataPath, 'utf8')
  const parsedData = JSON.parse(rawData)

  const { error, value } = serversSchema.validate(parsedData)

  if (error) {
    throw new Error(`Invalid MCP servers data: ${error.message}`)
  }

  cachedServers = value
  return cachedServers
}

/**
 * Get all MCP servers.
 *
 * @returns {Promise<McpServer[]>} Array of all server objects
 */
async function getServers () {
  return _loadServers()
}

/**
 * Get a specific server by ID.
 *
 * @param {string} id - The server's qualified name (e.g., 'io.github.github/github-mcp-server')
 * @returns {Promise<McpServer|undefined>} The server object or undefined if not found
 */
async function getServer (id) {
  const servers = await _loadServers()
  return servers.find((s) => s.id === id)
}

/**
 * Get a specific version of a server.
 *
 * @param {string} id - The server's qualified name
 * @param {string} version - The server version
 * @returns {Promise<McpServer|undefined>} The server object or undefined if not found
 */
async function getServerVersion (id, version) {
  const servers = await _loadServers()
  return servers.find((s) => s.id === id && s.version === version)
}

export { getServers, getServer, getServerVersion }
