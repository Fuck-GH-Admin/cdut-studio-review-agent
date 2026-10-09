/**
 * cdut-waf-instrumentor.ts — CDP 运行时内存插桩与动态瑞数 WAF 捕获器
 *
 * 架构职责（对应规格书 5.2）：
 * 在目标页面执行前注入 CDP 钩子（`Page.addScriptToEvaluateOnNewDocument`），
 * Hook `document.cookie` 的 setter，动态监听瑞数 WAF 的 `*P` / `*O` 会话 Cookie 赋值，
 * 自动截获最新有效凭证落盘至 `window.__cdut_waf_captured_signature`，无需任何人工逆向。
 *
 * 设计约定（与 yanhu-devtools-hub.ts 保持一致的 CDP 附加约定）：
 *   - attach 前先判 `isAttached()`，避免重复 attach 抛错；
 *   - 每条 CDP 命令带硬超时，失败静默降级，绝不向上抛出；
 *   - 不主动 detach 别人建立的调试器连接（共享调试器）。
 */

/** 瑞数服务端会话 Cookie 前缀（以 O 结尾，如 sMLAeTqisZbFO） */
const RUI_SHU_SESSION_COOKIE = 'sMLAeTqisZbFO'
/** 瑞数客户端页面级动态签名 Cookie 前缀（以 P 结尾，如 sMLAeTqisZbFP） */
const RUI_SHU_SIGNATURE_COOKIE = 'sMLAeTqisZbFP'
/** 捕获结果挂载的页面全局变量名 */
export const WAF_SIGNATURE_GLOBAL = '__cdut_waf_captured_signature'

/** 单条 CDP 命令硬超时 */
const CDP_TIMEOUT_MS = 6000

/**
 * 注入脚本：Hook `document.cookie` 的 setter。
 *
 * 说明：务必保留 getter 透传，仅覆写 setter；若只定义 set 会导致页面读取
 * `document.cookie` 恒为 undefined，从而彻底破坏瑞数站点自身逻辑（红线）。
 * 通过页面级标记位保证幂等，避免重复注入导致 Hook 链式嵌套。
 */
const INJECTION_SCRIPT = `
(function() {
  try {
    if (window.__cdut_waf_hooked__) return;
    window.__cdut_waf_hooked__ = true;
    window.__cdut_waf_hooked_at__ = Date.now();
    if (typeof window.${WAF_SIGNATURE_GLOBAL} === 'undefined') {
      window.${WAF_SIGNATURE_GLOBAL} = null;
    }
    var cookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
                     Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
    if (cookieDesc && cookieDesc.set) {
      var origSet = cookieDesc.set;
      var origGet = cookieDesc.get;
      var hooked = {
        configurable: true,
        enumerable: cookieDesc.enumerable === true,
        get: origGet ? function() { return origGet.call(this); } : undefined,
        set: function(val) {
          try {
            if (typeof val === 'string' &&
                (val.indexOf('${RUI_SHU_SESSION_COOKIE}') !== -1 ||
                 val.indexOf('${RUI_SHU_SIGNATURE_COOKIE}') !== -1)) {
              window.${WAF_SIGNATURE_GLOBAL} = val;
            }
          } catch (e) { /* 静默 */ }
          return origSet.call(this, val);
        }
      };
      Object.defineProperty(document, 'cookie', hooked);
    }
  } catch (e) { /* 静默降级 */ }
})();
`

/** WebContents 是否处于可安全操作状态 */
function isUsable(wc: Electron.WebContents | null | undefined): wc is Electron.WebContents {
  return !!wc && !wc.isDestroyed()
}

/** 确保调试器已附加（未附加则 attach）；失败返回 false */
function ensureAttached(wc: Electron.WebContents): boolean {
  try {
    if (wc.debugger.isAttached()) return true
    wc.debugger.attach('1.3')
    return true
  } catch {
    return false
  }
}

/**
 * 发送 CDP 命令（带硬超时，失败安全降级）。
 */
function sendCommand(
  wc: Electron.WebContents,
  method: string,
  params?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (!isUsable(wc) || !wc.debugger.isAttached()) {
    return Promise.reject(new Error('CDP 未附加'))
  }
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP ${method} 超时`)), CDP_TIMEOUT_MS)
    wc.debugger.sendCommand(method, params).then(
      (result) => {
        clearTimeout(timer)
        resolve((result as Record<string, unknown>) ?? {})
      },
      (err) => {
        clearTimeout(timer)
        reject(err instanceof Error ? err : new Error(String(err)))
      },
    )
  })
}

/**
 * 安装瑞数 WAF 插桩器。
 *
 * 先启用 `Page` 与 `Runtime` 域，再通过 `Page.addScriptToEvaluateOnNewDocument`
 * 注入 Hook 脚本，使其在每个新文档的最早时机执行，从而捕获首次写入的 `*P` 签名。
 *
 * 任何一步失败均静默降级（缺少捕获能力不影响页面正常访问）。
 */
export async function installRuiShuWafInstrumentor(webContents: Electron.WebContents): Promise<void> {
  if (!isUsable(webContents)) return
  try {
    if (!ensureAttached(webContents)) return

    for (const domain of ['Page.enable', 'Runtime.enable']) {
      try {
        await sendCommand(webContents, domain)
      } catch {
        // 忽略单个域启用失败
      }
    }

    await sendCommand(webContents, 'Page.addScriptToEvaluateOnNewDocument', {
      source: INJECTION_SCRIPT,
    })
  } catch {
    // 插桩失败静默忽略
  }
}

/**
 * 读取最近一次捕获到的瑞数会话/签名字符串。
 *
 * @returns 命中时返回原始 Cookie 赋值字符串；未捕获或页面不可用时返回 null
 */
export async function readCapturedWafSignature(webContents: Electron.WebContents): Promise<string | null> {
  if (!isUsable(webContents)) return null
  try {
    if (!webContents.debugger.isAttached()) return null
    const result = await sendCommand(webContents, 'Runtime.evaluate', {
      expression: `window.${WAF_SIGNATURE_GLOBAL} ?? null`,
      returnByValue: true,
      silent: true,
    })
    const remote = result.result && typeof result.result === 'object'
      ? (result.result as Record<string, unknown>)
      : {}
    const value = remote.value
    return typeof value === 'string' && value.length > 0 ? value : null
  } catch {
    // 读取失败静默降级
    return null
  }
}
