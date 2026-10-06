/**
 * 审核操作工具（review-ops 能力组，08 设计 §4：C1 11 项）
 *
 * - 显式指派是唯一写权限来源：每次写操作携带 assignmentId，checkAssignment 五重校验
 * - 决定类（decide_stage/resolve_supplement）属 C2，本模块不注册
 * - 工具直调审核服务层（同进程，与 IPC handler 同源）；不模拟点击、不经 renderer
 * - 摘要输出：不返回材料全文/assetPath；材料里的内容一律按数据处理
 * - 路径授权：realpath 后必须落在会话授权目录内（防符号链接逃逸）
 */
import { Type } from 'typebox'
import { realpathSync } from 'node:fs'
import { dirname, isAbsolute, join, sep } from 'node:path'
import { checkAssignment, actorOfAssignment, bindCaseToAssignment, type ReviewAssignmentAction } from '../review/review-agent-assignment'
import type { ToolDefinition } from '@earendil-works/pi-coding-agent'
import type { AgentToolResult } from '@earendil-works/pi-agent-core'
type PiSdk = typeof import('@earendil-works/pi-coding-agent')

/** 工具结果辅助：结构化 JSON 摘要（错误也结构化返回，不抛到模型层） */
function result(payload: unknown, isError = false): AgentToolResult<unknown> {
  return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }], details: payload, isError } as AgentToolResult<unknown>
}

/** realpath 后验证路径归属（防 startsWith 前缀碰撞与符号链接逃逸） */
export function isPathUnderRoots(sourcePath: string, allowedRoots: string[]): boolean {
  if (!isAbsolute(sourcePath)) return false
  let real: string
  try {
    real = realpathSync(sourcePath)
  } catch {
    return false
  }
  return allowedRoots.some((root) => {
    try {
      const realRoot = realpathSync(root)
      return real === realRoot || real.startsWith(realRoot + sep)
    } catch {
      return false
    }
  })
}

/** 工具执行上下文（orchestrator 注入；指派校验与授权目录都从这里来） */
export interface ReviewOpsToolsContext {
  sessionId: string
  /** 当前轮次来源（08 设计：仅 user 轮可写；automation/goal/delegation 拒绝） */
  triggeredBy?: 'user' | 'automation' | 'delegation' | 'goal'
  /** 会话授权目录（复用 collectAttachedDirectories 同源清单） */
  allowedRoots: string[]
  disabledTools?: string[]
}

/** 通用参数：指派 ID（每个写操作必带） */
const AssignmentParam = { assignmentId: Type.String({ minLength: 4, description: '可信指派 ID（用户显式指派生成，asg- 前缀）' }) }

/** 案卷摘要（不含材料全文与 assetPath） */
function caseSummary(aggregate: { caseV2: { id: string; title: string; stage: string; revision: number; templateId: string; templateVersion: number; documents: Array<{ versionId: string; fileName: string; active?: boolean; materialSlotId?: string }> }; tasks: Array<{ id: string; stageId: string; status: string; round: number; assigneeRole: string }> }): Record<string, unknown> {
  return {
    caseId: aggregate.caseV2.id,
    title: aggregate.caseV2.title,
    stage: aggregate.caseV2.stage,
    revision: aggregate.caseV2.revision,
    template: `${aggregate.caseV2.templateId}@${aggregate.caseV2.templateVersion}`,
    documents: aggregate.caseV2.documents.filter((doc) => doc.active !== false).map((doc) => ({ versionId: doc.versionId, fileName: doc.fileName, slot: doc.materialSlotId ?? null })),
    openTasks: aggregate.tasks.filter((task) => task.status === 'open').map((task) => ({ taskId: task.id, stageId: task.stageId, round: task.round, assigneeRole: task.assigneeRole })),
  }
}

export function buildReviewOpsTools(sdk: PiSdk, ctx: ReviewOpsToolsContext): ToolDefinition[] {
  const enabled = (name: string): boolean => !(ctx.disabledTools ?? []).includes(name)

  /** 写操作前置：指派校验 → 返回 actor/assignment；失败抛结构化错误 */
  const requireAssignment = (assignmentId: string, action: ReviewAssignmentAction): { actorId: string; role: 'reviewer' | 'student'; assignment: ReturnType<typeof checkAssignment>['assignment'] } => {
    if (ctx.triggeredBy && ctx.triggeredBy !== 'user') throw new Error(`仅用户发起的轮次可执行审核写操作（当前: ${ctx.triggeredBy}）`)
    const check = checkAssignment({ assignmentId, sessionId: ctx.sessionId, action, turnTriggeredBy: ctx.triggeredBy })
    if (!check.ok || !check.assignment) throw new Error(`指派校验失败[${check.code}]: ${check.message ?? '未知'}`)
    const actor = actorOfAssignment(check.assignment)
    return { actorId: actor.actorId, role: actor.role, assignment: check.assignment }
  }

  const tools: ToolDefinition[] = []

  // 1) 查询可用已发布模板（建案入口）
  if (enabled('review_list_templates')) {
    tools.push(sdk.defineTool({
      name: 'review_list_templates',
      label: '查询审核模板',
      description: '列出当前可用的已发布审核模板（名称/版本/字段/材料槽摘要）。建案前先查询。',
      parameters: Type.Object({}),
      async execute() {
        try {
          const { listTemplates } = require('../review/template-store') as typeof import('../review/template-store')
          const templates = listTemplates().filter((template) => template.status === 'published')
          return result({
            templates: templates.map((template) => ({
              templateId: template.templateId, version: template.version, name: template.name, objectType: template.objectType,
              fields: template.fields.map((field) => ({ key: field.key, label: field.label, kind: field.kind, required: field.required, scope: field.scope ?? 'subject' })),
              materialSlots: template.materialSlots.map((slot) => ({ id: slot.id, name: slot.name, acceptedKinds: slot.acceptedKinds, minCount: slot.minCount })),
              stages: template.stages.map((stage) => ({ id: stage.id, name: stage.name, kind: stage.kind, executorRole: stage.executorRole })),
            })),
          })
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 2) 读模板详情（字段 schema 锁定）
  if (enabled('review_get_template')) {
    tools.push(sdk.defineTool({
      name: 'review_get_template',
      label: '读取审核模板',
      description: '读取指定模板版本的完整字段 schema、材料槽与阶段定义。建案与填参数前调用，避免硬编码模板 ID。',
      parameters: Type.Object({
        templateId: Type.String({ minLength: 1 }),
        version: Type.Integer({ minimum: 1 }),
      }),
      async execute(_id, params) {
        try {
          const { templateId, version } = params as { templateId: string; version: number }
          const { getTemplate } = require('../review/template-store') as typeof import('../review/template-store')
          const template = getTemplate(templateId, version)
          if (!template || template.status !== 'published') return result({ error: `模板不存在或未发布: ${templateId}@${version}` }, true)
          return result({
            templateId: template.templateId, version: template.version, name: template.name, objectType: template.objectType,
            fields: template.fields.map((field) => ({ key: field.key, label: field.label, kind: field.kind, required: field.required, scope: field.scope ?? 'subject', unit: field.unit ?? null })),
            materialSlots: template.materialSlots.map((slot) => ({ id: slot.id, name: slot.name, purpose: slot.purpose, acceptedKinds: slot.acceptedKinds, minCount: slot.minCount, maxCount: slot.maxCount })),
            stages: template.stages.map((stage) => ({ id: stage.id, name: stage.name, kind: stage.kind, executorRole: stage.executorRole, nextStageId: stage.nextStageId ?? null })),
          })
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 3) 列案卷（限指派可见范围：绑定案卷或全部只读）
  if (enabled('review_list_cases')) {
    tools.push(sdk.defineTool({
      name: 'review_list_cases',
      label: '列出审核案卷',
      description: '列出审核案卷摘要（id/标题/阶段/revision）。返回结构化列表，不含材料内容。',
      parameters: Type.Object({ assignmentId: Type.Optional(AssignmentParam.assignmentId) }),
      async execute(_id, params) {
        try {
          const { listAggregatesV2 } = require('../review/case-store-v2') as typeof import('../review/case-store-v2')
          const all = listAggregatesV2()
          // 携带指派时收敛到绑定案卷（未携带=纯只读浏览，不含任何后续写授权）
          const assignmentId = (params as { assignmentId?: string }).assignmentId
          if (assignmentId) {
            const check = checkAssignment({ assignmentId, sessionId: ctx.sessionId, action: 'list', turnTriggeredBy: ctx.triggeredBy })
            if (!check.ok) return result({ error: `指派校验失败[${check.code}]: ${check.message}` }, true)
            const bound = check.assignment?.caseId
            return result({ cases: all.filter((item) => !bound || item.caseId === bound) })
          }
          return result({ cases: all })
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 4) 读案卷摘要（不含材料全文）
  if (enabled('review_get_case')) {
    tools.push(sdk.defineTool({
      name: 'review_get_case',
      label: '读取审核案卷',
      description: '读取案卷摘要：状态/字段/材料清单（文件名与版本，不含内容）/开放任务/下一步。判断下一步动作前调用。',
      parameters: Type.Object({ caseId: Type.String({ minLength: 4 }) }),
      async execute(_id, params) {
        try {
          const { getCaseV2Aggregate } = require('../review/application-service') as typeof import('../review/application-service')
          const aggregate = getCaseV2Aggregate((params as { caseId: string }).caseId)
          if (!aggregate) return result({ error: '案卷不存在' }, true)
          return result(caseSummary(aggregate))
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 5) 建案（指派 + 模板锁定 + 绑定 caseId）
  if (enabled('review_create_case')) {
    tools.push(sdk.defineTool({
      name: 'review_create_case',
      label: '创建审核案卷',
      description: '从已发布模板创建案卷（字段值 + 事项列表）。需 assignmentId；建案型指派成功后自动绑定 caseId。幂等：同 requestId 重试返回原案。',
      parameters: Type.Object({
        ...AssignmentParam,
        templateId: Type.String({ minLength: 1 }),
        templateVersion: Type.Integer({ minimum: 1 }),
        title: Type.String({ minLength: 1, maxLength: 120 }),
        fieldValues: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
        subjects: Type.Optional(Type.Array(Type.Object({ id: Type.String({ minLength: 1 }), type: Type.Optional(Type.String()), title: Type.String({ minLength: 1 }), fieldValues: Type.Optional(Type.Record(Type.String(), Type.Unknown())) }))),
      }),
      async execute(_id, params) {
        try {
          const input = params as { assignmentId: string; templateId: string; templateVersion: number; title: string; fieldValues?: Record<string, unknown>; subjects?: Array<{ id: string; type?: string; title: string; fieldValues?: Record<string, unknown> }> }
          const guard = requireAssignment(input.assignmentId, 'create-case')
          const assignment = guard.assignment!
          // 指派锁定的模板必须一致
          if (assignment.templateId && (assignment.templateId !== input.templateId || assignment.templateVersion !== input.templateVersion)) {
            return result({ error: `指派锁定模板 ${assignment.templateId}@${assignment.templateVersion}，与请求 ${input.templateId}@${input.templateVersion} 不一致` }, true)
          }
          if (assignment.caseId) return result({ error: `指派已绑定案卷 ${assignment.caseId}（一次指派一个案卷）` }, true)
          const { createCaseFromTemplate } = require('../review/application-service') as typeof import('../review/application-service')
          const caseId = `case-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
          const outcome = await createCaseFromTemplate(input.templateId, input.templateVersion, {
            title: input.title,
            fieldValues: (input.fieldValues ?? {}) as never,
            subjects: (input.subjects ?? []).map((subject) => ({ id: subject.id, type: subject.type ?? 'person', title: subject.title, fieldValues: (subject.fieldValues ?? {}) as never })) as never,
          }, { actorId: guard.actorId, actorSource: 'agent', role: guard.role }, caseId)
          if (!outcome.ok) return result({ error: `建案失败[${outcome.code}]: ${outcome.message}`, currentRevision: outcome.currentRevision }, true)
          bindCaseToAssignment(input.assignmentId, caseId)
          return result({ caseId, title: input.title, revision: outcome.aggregate.caseV2.revision, stage: outcome.aggregate.caseV2.stage })
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 6) 登记材料（realpath 目录归属 + 指派）
  if (enabled('review_register_material')) {
    tools.push(sdk.defineTool({
      name: 'review_register_material',
      label: '登记审核材料',
      description: '把授权目录内的本地文件登记进案卷材料槽（复制原件并计算哈希）。返回 documentVersionId。路径必须在本会话授权目录内。',
      parameters: Type.Object({
        ...AssignmentParam,
        caseId: Type.String({ minLength: 4 }),
        sourcePath: Type.String({ minLength: 2, description: '本地文件的绝对路径（必须在本会话授权目录内）' }),
        materialSlotId: Type.String({ minLength: 1, description: '材料槽 ID（从 review_get_template 获得）' }),
      }),
      async execute(_id, params) {
        try {
          const input = params as { assignmentId: string; caseId: string; sourcePath: string; materialSlotId: string }
          const guard = requireAssignment(input.assignmentId, 'register-material')
          const assignment = guard.assignment!
          if (assignment.caseId && assignment.caseId !== input.caseId) return result({ error: `指派绑定的是案卷 ${assignment.caseId}，不能操作 ${input.caseId}` }, true)
          if (!isPathUnderRoots(input.sourcePath, ctx.allowedRoots)) return result({ error: '文件路径不在本会话授权目录内（拒绝登记）' }, true)
          const { registerMaterial } = require('../review/material-service') as typeof import('../review/material-service')
          const { getCaseV2Aggregate } = require('../review/application-service') as typeof import('../review/application-service')
          const fresh = getCaseV2Aggregate(input.caseId)
          if (!fresh) return result({ error: `案卷不存在: ${input.caseId}` }, true)
          const outcome = await registerMaterial(input.caseId, {
            requestId: `reg-${input.assignmentId}-${Date.now().toString(36)}`,
            actor: { actorId: guard.actorId, actorSource: 'agent', role: guard.role },
            expectedRevision: fresh.caseV2.revision,
            payload: { sourcePath: input.sourcePath, role: 'application', materialSlotId: input.materialSlotId },
          }) as { ok: boolean; message?: string; entity?: { versionId: string; fileName: string } }
          if (!outcome.ok) return result({ error: outcome.message ?? '登记失败' }, true)
          return result({ caseId: input.caseId, documentVersionId: outcome.entity?.versionId, fileName: outcome.entity?.fileName, slot: input.materialSlotId })
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 7) 提交案卷
  if (enabled('review_submit_case')) {
    tools.push(sdk.defineTool({
      name: 'review_submit_case',
      label: '提交审核案卷',
      description: '提交案卷进入审核流程（draft→submitted，创建首阶段任务）。材料槽不足会被拒绝。',
      parameters: Type.Object({
        ...AssignmentParam,
        caseId: Type.String({ minLength: 4 }),
      }),
      async execute(_id, params) {
        try {
          const input = params as { assignmentId: string; caseId: string }
          const guard = requireAssignment(input.assignmentId, 'submit-case')
          const assignment = guard.assignment!
          if (assignment.caseId && assignment.caseId !== input.caseId) return result({ error: `指派绑定的是案卷 ${assignment.caseId}` }, true)
          const { submitCaseV2 } = require('../review/stage-workflow') as typeof import('../review/stage-workflow')
          const outcome = await submitCaseV2(input.caseId, { actorId: guard.actorId, actorSource: 'agent', role: guard.role }, { assignmentId: input.assignmentId, sessionId: ctx.sessionId })
          if (!outcome.ok) return result({ error: `提交失败[${outcome.code}]: ${outcome.message}` }, true)
          return result({ caseId: input.caseId, stage: outcome.aggregate.caseV2.stage, revision: outcome.aggregate.caseV2.revision, openTasks: outcome.aggregate.tasks.filter((task) => task.status === 'open').map((task) => ({ taskId: task.id, stageId: task.stageId })) })
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 8) 异步发起审核
  if (enabled('review_start_run')) {
    tools.push(sdk.defineTool({
      name: 'review_start_run',
      label: '发起自动审核',
      description: '异步启动一次真实模型审核运行。立即返回 runId；用 review_get_run_status 轮询。同案进行中的运行会被去重拒绝。',
      parameters: Type.Object({
        ...AssignmentParam,
        caseId: Type.String({ minLength: 4 }),
      }),
      async execute(_id, params) {
        try {
          const input = params as { assignmentId: string; caseId: string }
          const guard = requireAssignment(input.assignmentId, 'start-run')
          const assignment = guard.assignment!
          if (assignment.caseId && assignment.caseId !== input.caseId) return result({ error: `指派绑定的是案卷 ${assignment.caseId}` }, true)
          const { startReviewRunAsync } = require('../review/run-async-service') as typeof import('../review/run-async-service')
          const started = startReviewRunAsync(input.caseId, { actorId: guard.actorId, actorSource: 'agent', role: guard.role }, { assignmentId: input.assignmentId, sessionId: ctx.sessionId })
          return result(started)
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 9) 查询运行状态（caseId+runId 归属）
  if (enabled('review_get_run_status')) {
    tools.push(sdk.defineTool({
      name: 'review_get_run_status',
      label: '查询审核运行状态',
      description: '读取指定运行的状态（running/completed/failed/cancelled）、检查结果摘要与结论。completed 表示技术执行完成，不代表业务批准。',
      parameters: Type.Object({
        caseId: Type.String({ minLength: 4 }),
        runId: Type.String({ minLength: 4 }),
      }),
      async execute(_id, params) {
        try {
          const input = params as { caseId: string; runId: string }
          const { getRunById } = require('../review/run-async-service') as typeof import('../review/run-async-service')
          const run = getRunById(input.caseId, input.runId)
          if (!run) return result({ error: `运行不存在: ${input.runId}` }, true)
          return result({
            runId: run.id, caseId: run.caseId, status: run.status,
            initiatedBy: run.initiatedBy ? { actorSource: run.initiatedBy.actorSource, role: run.initiatedBy.role } : null,
            coverage: run.coverage,
            checks: run.checks.map((check) => {
              const item = check as { ruleId: string; status: string; reason?: string }
              return { ruleId: item.ruleId, status: item.status, reason: item.reason ?? null }
            }),
            opinion: run.opinions[0] ?? null,
            diagnostics: run.diagnostics,
            error: run.error ?? null,
          })
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 10) 取消运行
  if (enabled('review_cancel_run')) {
    tools.push(sdk.defineTool({
      name: 'review_cancel_run',
      label: '取消审核运行',
      description: '取消指定案卷的进行中运行（活跃运行立即中止；已结束运行返回当前状态）。',
      parameters: Type.Object({
        ...AssignmentParam,
        caseId: Type.String({ minLength: 4 }),
        runId: Type.String({ minLength: 4 }),
      }),
      async execute(_id, params) {
        try {
          const input = params as { assignmentId: string; caseId: string; runId: string }
          const guard = requireAssignment(input.assignmentId, 'cancel-run')
          const assignment = guard.assignment!
          if (assignment.caseId && assignment.caseId !== input.caseId) return result({ error: `指派绑定的是案卷 ${assignment.caseId}` }, true)
          const { cancelAsyncRun } = require('../review/run-async-service') as typeof import('../review/run-async-service')
          const cancelled = cancelAsyncRun(input.runId)
          return result({ runId: input.runId, cancelRequested: true, wasActive: cancelled })
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  // 11) 导出报告
  if (enabled('review_export_report')) {
    tools.push(sdk.defineTool({
      name: 'review_export_report',
      label: '导出审核报告',
      description: '导出案卷审核报告（MD）到案卷受控目录 reports/，返回文件路径。产物经应用内入口查看。',
      parameters: Type.Object({
        ...AssignmentParam,
        caseId: Type.String({ minLength: 4 }),
      }),
      async execute(_id, params) {
        try {
          const input = params as { assignmentId: string; caseId: string }
          const guard = requireAssignment(input.assignmentId, 'export-report')
          const assignment = guard.assignment!
          if (assignment.caseId && assignment.caseId !== input.caseId) return result({ error: `指派绑定的是案卷 ${assignment.caseId}` }, true)
          const { exportCaseReport } = require('../review/report-export-v2-service') as typeof import('../review/report-export-v2-service')
          return result(exportCaseReport(input.caseId))
        } catch (error) {
          return result({ error: error instanceof Error ? error.message : String(error) }, true)
        }
      },
    }))
  }

  return tools
}
