import { statusCodes } from '../../constants/status-codes.js'
import { getServers } from '../../api/registry/service.js'

/**
 * Get registry homepage controller
 *
 * @param {import('@hapi/hapi').Request} request - Hapi request object
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject} The response object for the homepage
 */
function getRegistry (_request, h) {
  const servers = getServers()
  return h.view('registry/page.njk', { servers })
    .code(statusCodes.HTTP_STATUS_OK)
}

export {
  getRegistry
}
