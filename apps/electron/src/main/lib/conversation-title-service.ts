/**
 * 对话标题生成服务
 *
 * 从原 chat-service.ts（Chat 流式引擎，已随 Chat 模式删除）中提取的纯标题能力，
 * 供侧边栏「重新生成标题」等存活着陆点使用。
 * 依赖 title-generation.ts 的窗口规则与 @profer/core 的 provider 适配层。
 */

import { resolveXaiCredentialMode } from '@profer/shared'
import type { ConversationMeta, GenerateTitleInput } from '@profer/shared'
import { getAdapter, fetchTitle } from '@profer/core'
import { listChannels, decryptApiKey, isCommercialMode } from './channel-manager'
import { getTeamAuthWithRefresh } from './auth-service'
import { updateConversationMeta, getConversationBranch, getConversationMeta } from './conversation-manager'
import { getFetchFn } from './proxy-fetch'
import { getEffectiveProxyUrl } from './proxy-settings-service'
import { isCommercialBuild } from './build-target'
import { isOfficialManagedChannel } from './official-channel'
import type { ProviderType } from '@profer/shared'
import {
  buildTitlePrompt,
  buildWindowTitlePrompt,
  collectTitleSources,
  sanitizeGeneratedTitle,
  MAX_TITLE_LENGTH,
  SHORT_MESSAGE_THRESHOLD,
} from './title-generation'

const ANTHROPIC_PROXY_PROVIDERS = new Set<ProviderType>(['anthropic'])

/** 生成对话标题（直接调用模型，不写回元数据） */
export async function generateTitle(input: GenerateTitleInput): Promise<string | null> {
  const { userMessage, channelId, modelId, contextMessages } = input
  console.log('[标题生成] 开始生成标题:', { channelId, modelId, sourceCount: contextMessages?.length ?? 1, userMessage: userMessage.slice(0, 50) })

  // 短消息直接使用原文作为标题，避免 AI 幻觉。
  // 窗口路径（contextMessages）已经在收集阶段过滤过信息量，不再走这条短路。
  const trimmedMessage = userMessage.trim()
  if ((!contextMessages || contextMessages.length === 0) && trimmedMessage.length <= SHORT_MESSAGE_THRESHOLD) {
    const shortTitle = trimmedMessage.slice(0, MAX_TITLE_LENGTH)
    console.log('[标题生成] 消息过短，直接使用原文作为标题:', shortTitle)
    return shortTitle
  }

  const titlePrompt = contextMessages && contextMessages.length > 0
    ? buildWindowTitlePrompt(contextMessages)
    : buildTitlePrompt(userMessage)

  const channels = listChannels()
  const channel = channels.find((c) => c.id === channelId)
  if (!channel) {
    console.warn('[标题生成] 渠道不存在:', channelId)
    return null
  }

  try {
    const storedSecret = decryptApiKey(channelId)
    if (channel.provider === 'xai' && resolveXaiCredentialMode(channel.credentialMode, storedSecret) === 'oauth') {
      console.info('[标题生成] xAI 订阅 OAuth 不走 Chat API Key 标题生成')
      return null
    }
  } catch {
    console.warn('[标题生成] 解密 API Key 失败')
    return null
  }

  let apiKey: string
  let proxyBaseUrl = ''
  const shouldUseCommercialProxy = (isCommercialBuild() || isCommercialMode())
    && isOfficialManagedChannel(channel)
    && channel.directDataPlane !== true

  if (shouldUseCommercialProxy) {
    const auth = await getTeamAuthWithRefresh()
    if (!auth) {
      console.warn('[标题生成] 团队账号登录已过期，跳过 AI 标题生成')
      return null
    }
    const proxyPath = ANTHROPIC_PROXY_PROVIDERS.has(channel.provider) ? '/v1/proxy/messages' : '/v1/proxy/chat'
    proxyBaseUrl = `${auth.baseUrl}${proxyPath}`
    apiKey = auth.proxyToken || auth.token
  } else {
    try {
      apiKey = decryptApiKey(channelId)
    } catch {
      console.warn('[标题生成] 解密 API Key 失败')
      return null
    }
  }

  try {
    const adapter = getAdapter(channel.provider)
    const request = adapter.buildTitleRequest({
      baseUrl: proxyBaseUrl || channel.baseUrl,
      apiKey,
      modelId,
      prompt: titlePrompt,
    })

    if (proxyBaseUrl) request.url = proxyBaseUrl

    const proxyUrl = await getEffectiveProxyUrl()
    const fetchFn = getFetchFn(proxyUrl)
    const title = await fetchTitle(request, adapter, fetchFn)
    if (!title) {
      console.warn('[标题生成] API 返回空标题')
      return null
    }

    // 清洗引号/书名号并截断；兼容部分端点把 content 返回为内容块数组的情况
    const result = sanitizeGeneratedTitle(title)
    if (!result) {
      console.warn('[标题生成] 标题清洗后为空')
      return null
    }
    console.log('[标题生成] 成功生成标题:', result)
    return result
  } catch (error) {
    console.warn('[标题生成] 请求失败:', error)
    return null
  }
}

/**
 * 收集对话「激活分支」上可用于命名的用户消息。
 *
 * 只取激活分支，避免把已被切走/回退的分支内容算进主题；
 * 信息量过滤（命令、寒暄、注入块）统一在 title-generation 里做。
 */
function collectConversationTitleSources(conversationId: string): string[] {
  try {
    const messages = getConversationBranch(conversationId)
    return collectTitleSources(messages.filter((m) => m.role === 'user').map((m) => m.content))
  } catch (error) {
    console.warn('[标题服务] 读取对话消息用于命名失败:', error)
    return []
  }
}

/** 手动重新生成对话标题：绕过定稿锁定，用前几轮有效消息重命名并重新锁定 */
export async function regenerateConversationTitle(
  conversationId: string,
  channelId?: string,
  modelId?: string,
): Promise<ConversationMeta | null> {
  const meta = getConversationMeta(conversationId)
  if (!meta) return null
  const resolvedChannelId = channelId || meta.channelId
  const resolvedModelId = modelId || meta.modelId
  if (!resolvedChannelId || !resolvedModelId) {
    console.warn('[标题服务] 重新生成标题缺少可用渠道/模型:', { conversationId })
    return null
  }

  const sources = collectConversationTitleSources(conversationId)
  if (sources.length === 0) {
    console.log('[标题服务] 重新生成标题：没有有效来源')
    return null
  }

  const title = await generateTitle({
    userMessage: sources[0] ?? '',
    channelId: resolvedChannelId,
    modelId: resolvedModelId,
    contextMessages: sources,
  })
  if (!title) return null

  const latest = getConversationMeta(conversationId)
  if (!latest) return null
  return updateConversationMeta(conversationId, {
    title,
    titleAutoGeneratedAt: Date.now(),
    titleLockedAt: Date.now(),
  })
}
