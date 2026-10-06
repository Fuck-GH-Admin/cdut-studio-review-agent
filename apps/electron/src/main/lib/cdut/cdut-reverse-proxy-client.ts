/**
 * CDUT 逆向反代大模型客户端（第 9 个内置 Tool 的业务预留桩）
 *
 * 业务定位：
 *   允许发起 AI 根据当前上下文自行构造提问内容，经由主进程转发到逆向反代大模型接口，
 *   取回另一路大模型的结构化回答。该工具继承特区账户门禁保护（未登录即拦截）。
 *
 * 预留状态说明（如实标注）：
 *   - 本模块提供完整的 HTTP 转发框架与参数归一化逻辑；
 *   - 反代服务端点尚未正式绑定，端点缺失时返回结构化「预留未接入」响应，绝不伪造回答；
 *   - 端点可通过环境变量 CDUT_REVERSE_PROXY_ENDPOINT 注入，鉴权 Token 走 CDUT_REVERSE_PROXY_TOKEN。
 */

import type { CdutReverseProxyParams, CdutReverseProxyResult } from '@profer/shared'

/** 反代服务端点（预留接入位，正式环境由配置注入） */
const REVERSE_PROXY_ENDPOINT = process.env.CDUT_REVERSE_PROXY_ENDPOINT?.trim() || ''

/** 反代服务鉴权 Token（可选） */
const REVERSE_PROXY_TOKEN = process.env.CDUT_REVERSE_PROXY_TOKEN?.trim() || ''

/** 单次反代调用硬超时 */
const REVERSE_PROXY_TIMEOUT_MS = 60_000

interface ReverseProxyResponseBody {
  answer?: string
  content?: string
  text?: string
  error?: string
}

/**
 * 归一化反代服务返回体为统一的双模结果。
 * 兼容 answer / content / text 三种常见字段命名。
 */
function normalizeReverseProxyBody(body: ReverseProxyResponseBody): CdutReverseProxyResult {
  const answer = (body.answer ?? body.content ?? body.text ?? '').trim()
  if (!answer) {
    return {
      success: false,
      markdown: '⚠️ 反代大模型返回体为空，未取得有效回答。请稍后重试或调整提问内容。',
      json: { status: 'empty_response' },
    }
  }
  return {
    success: true,
    markdown: `## 反代大模型回答\n\n${answer}`,
    json: { status: 'ok', answer },
  }
}

/**
 * 执行一次 CDUT 逆向反代大模型调用。
 *
 * @param params 由发起 AI 构造的提问内容与可选上下文
 * @returns 统一双模结果（成功回答，或结构化预留 / 错误状态）
 */
export async function executeCdutReverseProxy(
  params: CdutReverseProxyParams,
): Promise<CdutReverseProxyResult> {
  const queryPrompt = params.queryPrompt?.trim()
  if (!queryPrompt) {
    return {
      success: false,
      markdown: '⚠️ queryPrompt 不能为空：发起 AI 必须根据上下文自行构造提问内容再调用本工具。',
      json: { status: 'invalid_params', reason: 'empty_query_prompt' },
    }
  }

  // 端点尚未接入时的预留返回，绝不伪造反代回答。
  if (!REVERSE_PROXY_ENDPOINT) {
    return {
      success: false,
      markdown:
        'ℹ️ CDUT 逆向反代大模型接口尚未接入（业务预留桩已就绪）。当前提问内容已构造完成，待端点配置后即可转发。\n\n' +
        `- 提问内容：${queryPrompt}\n` +
        (params.taskContext ? `- 任务上下文：${params.taskContext}\n` : '') +
        (params.targetTask ? `- 目标任务：${params.targetTask}\n` : ''),
      json: { status: 'reserved', reason: 'endpoint_not_configured', queryPrompt },
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REVERSE_PROXY_TIMEOUT_MS)

  try {
    const response = await fetch(REVERSE_PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(REVERSE_PROXY_TOKEN ? { Authorization: `Bearer ${REVERSE_PROXY_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        queryPrompt,
        taskContext: params.taskContext,
        targetTask: params.targetTask,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      return {
        success: false,
        markdown: `⚠️ 反代大模型接口返回异常（HTTP ${response.status}）。`,
        json: { status: 'http_error', httpStatus: response.status, detail: errorText.slice(0, 500) },
        error: `HTTP ${response.status}`,
      }
    }

    const body = (await response.json()) as ReverseProxyResponseBody
    return normalizeReverseProxyBody(body)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      markdown: `⚠️ 反代大模型调用失败：${message}`,
      json: { status: 'request_failed', reason: message },
      error: message,
    }
  } finally {
    clearTimeout(timer)
  }
}
