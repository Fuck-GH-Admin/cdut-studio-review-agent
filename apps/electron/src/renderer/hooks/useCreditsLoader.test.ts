import { afterAll, beforeEach, describe, expect, test } from 'bun:test'
import { createStore } from 'jotai'
import {
  creditsBalanceAtom,
  creditsBalancePackageAtom,
  creditsLifetimeConsumedAtom,
} from '@/atoms/credits-atoms'
import { refreshCreditsInto } from './useCreditsLoader'

const originalFetch = globalThis.fetch
const originalNavigator = globalThis.navigator

function setOnline(online: boolean): void {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { onLine: online },
  })
}

function installWindow(commercial = true): void {
  ;(globalThis as unknown as {
    window: { electronAPI: { getCommercialMode: () => Promise<boolean>; auth: { getTeamAuth: () => Promise<{ baseUrl: string; token: string }> } } }
  }).window = {
    electronAPI: {
      getCommercialMode: async () => commercial,
      auth: { getTeamAuth: async () => ({ baseUrl: 'https://profer.example', token: 'token' }) },
    },
  }
}

describe('refreshCreditsInto', () => {
  beforeEach(() => {
    setOnline(true)
    installWindow()
    globalThis.fetch = originalFetch
  })

  test('离线时跳过余额请求并保留已有快照', async () => {
    const store = createStore()
    store.set(creditsBalanceAtom, 12)
    let fetchCalls = 0
    globalThis.fetch = (async () => {
      fetchCalls += 1
      throw new Error('should not fetch while offline')
    }) as unknown as typeof fetch
    setOnline(false)

    await refreshCreditsInto(store)

    expect(fetchCalls).toBe(0)
    expect(store.get(creditsBalanceAtom)).toBe(12)
  })

  test('网络恢复后可以重新同步余额', async () => {
    const store = createStore()
    let fetchCalls = 0
    globalThis.fetch = (async () => {
      fetchCalls += 1
      return new Response(JSON.stringify({ balance: 8.5, balancePackage: 6 }), { status: 200 })
    }) as unknown as typeof fetch

    setOnline(false)
    await refreshCreditsInto(store)
    setOnline(true)
    await refreshCreditsInto(store)

    expect(fetchCalls).toBe(1)
    expect(store.get(creditsBalanceAtom)).toBe(8.5)
    expect(store.get(creditsBalancePackageAtom)).toBe(6)
  })

  test('并发刷新共享同一个余额请求', async () => {
    const firstStore = createStore()
    const secondStore = createStore()
    let fetchCalls = 0
    let resolveFetch!: (response: Response) => void
    globalThis.fetch = (() => {
      fetchCalls += 1
      return new Promise<Response>((resolve) => { resolveFetch = resolve })
    }) as unknown as typeof fetch

    const first = refreshCreditsInto(firstStore)
    const second = refreshCreditsInto(secondStore)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(fetchCalls).toBe(1)
    resolveFetch(new Response(JSON.stringify({ balance: 3.2 }), { status: 200 }))
    await Promise.all([first, second])

    expect(firstStore.get(creditsBalanceAtom)).toBe(3.2)
    expect(secondStore.get(creditsBalanceAtom)).toBe(3.2)
  })

  test('余额请求失败时不把已有余额重置为零', async () => {
    const store = createStore()
    store.set(creditsBalanceAtom, 7)
    globalThis.fetch = (async () => { throw new Error('offline') }) as unknown as typeof fetch

    setOnline(false)
    await refreshCreditsInto(store)

    expect(store.get(creditsBalanceAtom)).toBe(7)
    expect(store.get(creditsLifetimeConsumedAtom)).toBe(0)
  })

  afterAll(() => {
    globalThis.fetch = originalFetch
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    })
  })
})
