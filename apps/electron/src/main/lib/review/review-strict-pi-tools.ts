/**
 * Narrow tool admission boundary for an already assigned direct Pi case review.
 * This is NOT a second executor: it selects existing review ops and delegates
 * original visual inspection to the existing inspect_preview tool.
 *
 * The model only supplies documentVersionId, never a filesystem path.
 */
import { realpathSync, statSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { Type } from 'typebox'
import type { ToolDefinition } from '@earendil-works/pi-coding-agent'
import { getConfigDir } from '../config-paths'
import { readAggregate } from './case-store-v2'
import { getPiReviewBindingForSession, type PiReviewBinding } from './pi-case-review-service'
import { assertSafeReviewStorageId } from './review-storage-id'

const DIRECT_OPS = [
  'review_read_documents',
  'review_inspect_document_image',
  'review_submit_result',
] as const

function errorResult(message: string) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
    details: { error: message },
    isError: true,
  }
}

function originalForCurrentBinding(binding: PiReviewBinding, documentVersionId: string): string {
  const current = getPiReviewBindingForSession(binding.sessionId)
  if (!current || current.caseId !== binding.caseId || current.runId !== binding.runId
    || current.assignmentId !== binding.assignmentId) {
    throw new Error('审核指派已经变化，本次原件读取已取消')
  }
  const aggregate = readAggregate(binding.caseId)
  const document = aggregate?.caseV2.documents.find(item => item.versionId === documentVersionId && item.active !== false)
  if (!document?.assetPath) throw new Error('材料版本不存在、未激活或原件路径缺失')
  assertSafeReviewStorageId(binding.caseId, 'caseId')
  const caseRoot = realpathSync(join(getConfigDir(), 'review-cases', binding.caseId))
  const assetPath = realpathSync(resolve(caseRoot, document.assetPath))
  const rel = relative(caseRoot, assetPath)
  if (!rel || rel === '..' || rel.startsWith(`..${isAbsolute(rel) ? '' : '/'}`) || isAbsolute(rel)
      || rel.split(/[\\/]/).includes('..')) {
    throw new Error('原件不在当前案卷授权目录内')
  }
  if (!statSync(assetPath).isFile()) throw new Error('原件不是普通文件')
  return assetPath
}

/**
 * Fail closed when an expected direct tool is absent/duplicated.
 * External MCP, arbitrary product tools and core read/write/bash are never forwarded.
 * The Pi adapter itself adds only CompactContext for the review profile.
 */
export function selectDirectReviewStrictTools(
  available: readonly ToolDefinition[],
  binding: PiReviewBinding,
): ToolDefinition[] {
  const selected = DIRECT_OPS.map(name => {
    const found = available.filter(tool => tool.name === name)
    if (found.length !== 1) throw new Error(`审核工具清单异常：${name} (${found.length})`)
    return found[0]!
  })
  const candidates = available.filter(tool => tool.name === 'inspect_preview')
  if (candidates.length !== 1) throw new Error('严格审核需要且仅允许一项原件视觉预览能力')
  const preview = candidates[0]!
  const inspectOriginal = {
    name: 'review_inspect_original',
    label: '核验本案材料原件',
    description: '仅按当前案卷已登记的材料版本 ID 核验原件页。扫描 PDF 或解析不足时可 scope=page/all 查看视觉页面。不能读取其他文件，原件预览不自动生成可引用的正文出处。',
    parameters: Type.Object({
      documentVersionId: Type.String({ minLength: 1 }),
      scope: Type.Optional(Type.Union([Type.Literal('overview'), Type.Literal('page'), Type.Literal('all')])),
      page: Type.Optional(Type.Integer({ minimum: 1 })),
    }),
    async execute(toolCallId: string, args: { documentVersionId: string; scope?: 'overview' | 'page' | 'all'; page?: number }, ...rest: unknown[]) {
      try {
        if (!args || typeof args.documentVersionId !== 'string') return errorResult('缺少材料版本 ID')
        if (args.scope && !['overview', 'page', 'all'].includes(args.scope)) return errorResult('原件预览范围无效')
        if (args.scope === 'page' && (!Number.isInteger(args.page) || (args.page ?? 0) < 1)) {
          return errorResult('页码必须是从 1 开始的整数')
        }
        if (args.scope !== 'page' && args.page !== undefined) return errorResult('页码仅可用于 scope=page')
        const filePath = originalForCurrentBinding(binding, args.documentVersionId)
        const delegate = preview.execute as (...parameters: unknown[]) => Promise<unknown>
        return await delegate(toolCallId, {
          filePath, mode: 'visual', scope: args.scope ?? 'overview',
          ...(args.page !== undefined ? { page: args.page } : {}),
        }, ...rest)
      } catch (cause) {
        return errorResult(cause instanceof Error ? cause.message : String(cause))
      }
    },
  } as unknown as ToolDefinition
  return [...selected, inspectOriginal]
}
