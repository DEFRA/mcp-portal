import { createRequire } from 'node:module'
import path from 'node:path'
import url from 'node:url'

import { statusCodes } from '../../constants/status-codes.js'

const require = createRequire(import.meta.url)
const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const servers = require(path.resolve(dirname, '../../data/mcp-servers.json'))

/**
 * Get registry homepage controller
 *
 * @param {import('@hapi/hapi').Request} request - Hapi request object
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject} The response object for the homepage
 */
function getRegistry (_request, h) {
  return h.view('registry/page.njk', { servers })
    .code(statusCodes.HTTP_STATUS_OK)
}

export {
  getRegistry
}
