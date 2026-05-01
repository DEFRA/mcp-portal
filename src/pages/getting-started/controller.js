import { statusCodes } from '../../constants/status-codes.js'

/**
 * Get getting started page controller
 *
 * @param {import('@hapi/hapi').Request} request - Hapi request object
 * @param {import('@hapi/hapi').ResponseToolkit} h - Hapi response toolkit
 *
 * @returns {import('@hapi/hapi').ResponseObject} The response object for the getting started page
 */
function getGettingStarted (request, h) {
  return h.view('getting-started/page.njk', { page: 'getting-started' })
    .code(statusCodes.HTTP_STATUS_OK)
}

export {
  getGettingStarted
}
