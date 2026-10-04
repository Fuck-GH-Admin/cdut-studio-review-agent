/**
 * 通用图片渲染 —— 远程图片 URL 解析与确认
 *
 * 供渲染层「通用图片渲染能力」调用：给定任意 http(s) URL，确认其是否为
 * 受支持的位图（PNG/JPEG/GIF/WebP），确认后以 data URL 返回。渲染层因此
 * 无需直连外网，规避 CORS 与信息泄露。
 *
 * 安全护栏：
 *   - 仅允许 http/https；
 *   - 拒绝 localhost / 私有网段 / 链路本地 / 元数据地址（SSRF 防护）；
 *   - 请求超时与单图体积上限；
 *   - 以文件魔数校验真实格式（避免把 HTML 登录页/伪装文件当图片）；
 *   - 结果按 URL 缓存，避免重复外呼。
 */

import type { ChatImageMediaType, ResolveImageUrlResult } from '@profer/shared'
import { detectAgentImage } from './agent-image-output-service'

/** 单张远程图片最大字节数：10 MiB（超限直接在探测阶段拒绝） */
export const MAX_REMOTE_IMAGE_SIZE = 10 * 1024 * 1024

/** 单次请求超时（毫秒） */
const REQUEST_TIMEOUT_MS = 8000
/** 结果缓存有效期（毫秒） */
const CACHE_TTL_MS = 10 * 60 * 1000
/** 结果缓存容量上限 */
const CACHE_MAX_ENTRIES = 24
/** 仅缓存不超过 4 MiB 的图片，避免内存膨胀 */
const CACHE_DATAURL_MAX = 4 * 1024 * 1024

const IMAGE_EXTENSION_RE = /\.(png|jpe?g|gif|webp)$/i

interface CacheEntry {
  result: ResolveImageUrlResult
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

/** 判断主机名是否属于本地/私有/链路本地/元数据地址 */
function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host === '0.0.0.0' || host.endsWith('.local')) return true
  if (host === '::1') return true

  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (m) {
    const a = Number(m[1])
    const b = Number(m[2])
    if (a === 0 || a === 10 || a === 127) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
  }
  return false
}

/** URL 路径（去 query/hash）是否以图片扩展名结尾 */
function pathLooksLikeImage(url: URL): boolean {
  return IMAGE_EXTENSION_RE.test(url.pathname)
}

function readCache(url: string): ResolveImageUrlResult | undefined {
  const hit = cache.get(url)
  if (!hit) return undefined
  if (hit.expiresAt <= Date.now()) {
    cache.delete(url)
    return undefined
  }
  return hit.result
}

function writeCache(url: string, result: ResolveImageUrlResult): void {
  const cacheable = !result.ok || (result.dataUrl ? result.dataUrl.length <= CACHE_DATAURL_MAX : false)
  if (!cacheable) return
  cache.set(url, { result, expiresAt: Date.now() + CACHE_TTL_MS })
  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

/** 探测并确认远程 URL 是否为受支持的图片 */
async function downloadAndConfirm(parsed: URL, original: string): Promise<ResolveImageUrlResult> {
  try {
    const res = await fetch(original, {
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: 'image/*' },
    })
    if (!res.ok) return { ok: false, reason: `http-${res.status}` }

    const rawMime = (res.headers.get('content-type') || '').split(';')[0]?.trim().toLowerCase() || ''
    const contentIsImage = rawMime.startsWith('image/')
    if (!contentIsImage && !pathLooksLikeImage(parsed)) {
      try { await res.body?.cancel() } catch { /* 忽略取消异常 */ }
      return { ok: false, reason: 'not-image' }
    }

    const lengthHeader = Number(res.headers.get('content-length') || '')
    if (Number.isFinite(lengthHeader) && lengthHeader > MAX_REMOTE_IMAGE_SIZE) {
      try { await res.body?.cancel() } catch { /* 忽略取消异常 */ }
      return { ok: false, reason: 'too-large' }
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length === 0) return { ok: false, reason: 'empty-body' }
    if (buffer.length > MAX_REMOTE_IMAGE_SIZE) return { ok: false, reason: 'too-large' }

    const detected = detectAgentImage(buffer)
    if (!detected) return { ok: false, reason: 'unsupported-format' }

    return {
      ok: true,
      mediaType: detected.mediaType as ChatImageMediaType,
      dataUrl: `data:${detected.mediaType};base64,${buffer.toString('base64')}`,
    }
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'fetch-failed'
    return { ok: false, reason }
  }
}

/**
 * 确认远程 URL 是否为图片。
 * @param rawUrl 待确认的 http(s) 地址
 * @returns 已确认时返回可直接渲染的 data URL；否则返回失败原因
 */
export async function resolveRemoteImageUrl(rawUrl: string): Promise<ResolveImageUrlResult> {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return { ok: false, reason: 'empty-url' }
  const trimmed = rawUrl.trim()

  const cached = readCache(trimmed)
  if (cached) return cached

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return { ok: false, reason: 'invalid-url' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'unsupported-protocol' }
  }
  if (isPrivateHostname(parsed.hostname)) {
    return { ok: false, reason: 'private-host-blocked' }
  }

  const result = await downloadAndConfirm(parsed, trimmed)
  writeCache(trimmed, result)
  return result
}
