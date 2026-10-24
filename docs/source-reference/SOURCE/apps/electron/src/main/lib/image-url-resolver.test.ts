/**
 * 远程图片 URL 解析器测试
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { resolveRemoteImageUrl } from './image-url-resolver'

const realFetch = globalThis.fetch

let fetchCalls = 0
let fetchImpl: (url: string) => Promise<Response>

const PNG_BYTES = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00])

function makeResponse(opts: {
  ok?: boolean
  status?: number
  contentType?: string
  contentLength?: string | null
  body?: Uint8Array
}): Response {
  const headers = new Headers()
  if (opts.contentType) headers.set('content-type', opts.contentType)
  if (opts.contentLength !== undefined && opts.contentLength !== null) headers.set('content-length', opts.contentLength)
  const bytes = opts.body ?? new Uint8Array()
  return {
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    headers,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    body: null,
  } as unknown as Response
}

beforeEach(() => {
  fetchCalls = 0
  fetchImpl = async () => makeResponse({ ok: false, status: 404 })
  globalThis.fetch = ((url: string) => {
    fetchCalls++
    return fetchImpl(String(url))
  }) as unknown as typeof fetch
})

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('resolveRemoteImageUrl', () => {
  it('扩展名与 content-type 均命中时返回 data URL', async () => {
    fetchImpl = async () => makeResponse({ contentType: 'image/png', body: PNG_BYTES })
    const result = await resolveRemoteImageUrl('https://example.com/a/photo.png')
    expect(result.ok).toBe(true)
    expect(result.mediaType).toBe('image/png')
    expect(result.dataUrl?.startsWith('data:image/png;base64,')).toBe(true)
  })

  it('仅有 content-type（无图片扩展名）也能确认', async () => {
    fetchImpl = async () => makeResponse({ contentType: 'image/jpeg', body: Uint8Array.from([0xff, 0xd8, 0xff, 0x00]) })
    const result = await resolveRemoteImageUrl('https://example.com/download?id=42')
    expect(result.ok).toBe(true)
    expect(result.mediaType).toBe('image/jpeg')
  })

  it('既非图片 content-type 也不是图片扩展名时拒绝', async () => {
    fetchImpl = async () => makeResponse({ contentType: 'text/html' })
    const result = await resolveRemoteImageUrl('https://example.com/page')
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('not-image')
  })

  it('拒绝私有/本地地址（SSRF 防护）', async () => {
    const localhost = await resolveRemoteImageUrl('http://localhost/a.png')
    expect(localhost.ok).toBe(false)
    expect(localhost.reason).toBe('private-host-blocked')

    const loopback = await resolveRemoteImageUrl('http://127.0.0.1/a.png')
    expect(loopback.ok).toBe(false)
    expect(loopback.reason).toBe('private-host-blocked')
  })

  it('拒绝非 http(s) 协议', async () => {
    const result = await resolveRemoteImageUrl('file:///etc/passwd')
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('unsupported-protocol')
  })

  it('按 content-length 拦截超大图片', async () => {
    fetchImpl = async () => makeResponse({
      contentType: 'image/png',
      contentLength: String(20 * 1024 * 1024),
      body: PNG_BYTES,
    })
    const result = await resolveRemoteImageUrl('https://example.com/huge.png')
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('too-large')
  })

  it('命中缓存时不重复请求', async () => {
    fetchImpl = async () => makeResponse({ contentType: 'image/png', body: PNG_BYTES })
    await resolveRemoteImageUrl('https://example.com/cached.png')
    await resolveRemoteImageUrl('https://example.com/cached.png')
    expect(fetchCalls).toBe(1)
  })
})
