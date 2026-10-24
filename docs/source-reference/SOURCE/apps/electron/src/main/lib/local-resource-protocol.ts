/**
 * Safe local resource protocol support for electron resources folder.
 * Maps cdut-resource://<path> to apps/electron/resources/<path> or process.resourcesPath.
 */

import { existsSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { app, net } from 'electron'

export function handleProferResourceRequest(request: Request): Response | Promise<Response> {
  let url: URL
  try {
    url = new URL(request.url)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const relativePath = decodeURIComponent((url.hostname + url.pathname).replace(/^\/+/, ''))
  const resourcesDir = app.isPackaged
    ? process.resourcesPath
    : join(__dirname, 'resources')

  const targetPath = resolve(resourcesDir, relativePath)
  const rel = relative(resourcesDir, targetPath)

  if (rel.startsWith('..') || rel.includes(':\\')) {
    return new Response('Forbidden', { status: 403 })
  }

  if (!existsSync(targetPath)) {
    return new Response('Not Found', { status: 404 })
  }

  return net.fetch(pathToFileURL(targetPath).toString())
}
