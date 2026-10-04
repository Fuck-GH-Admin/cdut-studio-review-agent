/**
 * V2 运行存储（M3，设计 03 §7 运行记录不可变输入 + 检查点持久化）
 *
 * 存储：review-cases/{caseId}/runs-v2/{runId}.json（整文件原子写，与 V1 同风格）
 * 运行状态机推进时整份重写：检查点/事件追加 → persisted after each node。
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewRunV2 } from '@profer/shared'
import { getConfigDir } from '../config-paths'

function runsDir(caseId: string): string {
  const dir = join(getConfigDir(), 'review-cases', caseId, 'runs-v2')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function runPath(caseId: string, runId: string): string {
  return join(runsDir(caseId), `${runId}.json`)
}

export function saveRunV2(run: ReviewRunV2): void {
  const filePath = runPath(run.caseId, run.id)
  const tmp = `${filePath}.tmp`
  writeFileSync(tmp, JSON.stringify(run, null, 2), 'utf-8')
  renameSync(tmp, filePath)
}

export function getRunV2(caseId: string, runId: string): ReviewRunV2 | undefined {
  const filePath = runPath(caseId, runId)
  if (!existsSync(filePath)) return undefined
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as ReviewRunV2
  } catch (error) {
    console.warn(`[审核V2] 运行文件解析失败: ${caseId}/${runId}`, error)
    return undefined
  }
}

export function listRunsV2(caseId: string): ReviewRunV2[] {
  const dir = runsDir(caseId)
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => getRunV2(caseId, name.replace('.json', '')))
    .filter((run): run is ReviewRunV2 => !!run)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

/** 节点产物目录：runs-v2/{runId}/artifacts/{nodeId}.json（不可变；恢复核验依据，R03） */
function artifactsDir(caseId: string, runId: string): string {
  const dir = join(getConfigDir(), 'review-cases', caseId, 'runs-v2', runId, 'artifacts')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export function saveArtifact(caseId: string, runId: string, nodeId: string, artifact: unknown): void {
  const filePath = join(artifactsDir(caseId, runId), `${nodeId}.json`)
  const tmp = `${filePath}.${Math.random().toString(36).slice(2, 6)}.tmp`
  writeFileSync(tmp, JSON.stringify(artifact, null, 2), 'utf-8')
  renameSync(tmp, filePath)
}

export function readArtifact<T = unknown>(caseId: string, runId: string, nodeId: string): T | undefined {
  const filePath = join(artifactsDir(caseId, runId), `${nodeId}.json`)
  if (!existsSync(filePath)) return undefined
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T
  } catch {
    return undefined // 结构损坏视为无产物（恢复时重做）
  }
}
