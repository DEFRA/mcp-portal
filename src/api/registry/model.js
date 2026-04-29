const REGISTRY_SCHEMA = 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json'

/**
 * @typedef {object} McpServerPackage
 * @property {string} registryType - e.g. 'npm', 'docker'
 * @property {string} identifier - e.g. '@github/github-mcp-server', 'mcp/sonarqube'
 * @property {string} [runtimeHint] - e.g. 'npx', 'docker'
 */

/**
 * @typedef {object} McpServerTransportHttp
 * @property {'http'} type
 * @property {string} url
 * @property {Record<string,string>} [headers]
 */

/**
 * @typedef {object} McpServerTransportStdio
 * @property {'stdio'} type
 * @property {McpServerPackage} [package] - Registry package to install and run
 * @property {string} [command] - Explicit command when not using a registry package
 * @property {string[]} [args]
 * @property {Record<string,string>} [env] - Environment variables required
 */

/**
 * @typedef {McpServerTransportHttp | McpServerTransportStdio} McpServerTransport
 */

/**
 * @typedef {object} McpServerRepository
 * @property {string} url
 * @property {string} source
 * @property {string} id
 */

/**
 * @typedef {object} McpServer
 * @property {string} id - Qualified name used as the registry identifier (namespace/name)
 * @property {string} title
 * @property {string} description
 * @property {string} version
 * @property {string} websiteUrl
 * @property {McpServerRepository} [repository]
 * @property {McpServerTransport[]} transports
 * @property {string} status - 'active' | 'deprecated' | 'inactive'
 * @property {string} publishedAt
 * @property {string} updatedAt
 */

/**
 * Conditionally include a property if a condition is truthy.
 * Reduces boilerplate for optional properties.
 *
 * @param {string} key
 * @param {*} condition
 * @param {*} value
 * @returns {object} Object with the property if condition is true, else empty object
 */
function includeIf (key, condition, value) {
  return condition ? { [key]: value } : {}
}

/**
 * Convert a stdio transport to a registry package entry.
 *
 * @param {McpServerTransportStdio} transport
 * @param {string} version
 * @returns {object|null} Package entry or null if no registry package
 */
function toPackage (transport, version) {
  if (transport.type !== 'stdio' || !transport.package) {
    return null
  }

  return {
    registryType: transport.package.registryType,
    identifier: transport.package.identifier,
    version,
    ...includeIf('runtimeHint', transport.package.runtimeHint, transport.package.runtimeHint),
    transport: { type: 'stdio' },
    ...includeIf('env', transport.env, transport.env)
  }
}

/**
 * Convert an HTTP transport to a registry remote entry.
 *
 * @param {McpServerTransportHttp} transport
 * @returns {object|null} Remote entry or null if not HTTP
 */
function toRemote (transport) {
  if (transport.type !== 'http') {
    return null
  }

  return {
    url: transport.url,
    ...includeIf('headers', transport.headers, transport.headers)
  }
}

/**
 * Converts an internal McpServer model to the MCP Registry v0.1 spec entry format.
 *
 * Stdio transports with a declared registry package are mapped to packages.
 * HTTP transports are mapped to remotes.
 *
 * @param {McpServer} server
 * @returns {object} MCP Registry v0.1 spec entry
 */
function toRegistryEntry (server) {
  const packages = server.transports
    .map((t) => toPackage(t, server.version))
    .filter(Boolean)

  const remotes = server.transports
    .map(toRemote)
    .filter(Boolean)

  return {
    server: {
      $schema: REGISTRY_SCHEMA,
      name: server.id,
      title: server.title,
      description: server.description,
      version: server.version,
      websiteUrl: server.websiteUrl,
      ...includeIf('repository', server.repository, server.repository),
      ...includeIf('packages', packages.length, packages),
      ...includeIf('remotes', remotes.length, remotes)
    },
    _meta: {
      'io.modelcontextprotocol.registry/official': {
        status: server.status,
        statusChangedAt: server.publishedAt,
        publishedAt: server.publishedAt,
        updatedAt: server.updatedAt,
        isLatest: true
      }
    }
  }
}

export { toRegistryEntry }
