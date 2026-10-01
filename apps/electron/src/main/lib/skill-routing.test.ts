import { afterEach, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEffectiveAgentPresetPolicy, type AgentPreset } from '@profer/shared'
import { createSkillRoutingSnapshot, routeSkillsForTask, type SkillRoutingSnapshot } from './skill-routing'

const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })
function fixture(overrides: Partial<AgentPreset> = {}, tools: string[] = []) {
  const root = mkdtempSync(join(tmpdir(), 'profer-skill-routing-'))
  roots.push(root)
  const skills = ['code-honor', 'pdf', 'automation', 'agent-collaboration', 'alpha', 'beta']
  for (const slug of skills) {
    mkdirSync(join(root, 'skills', slug), { recursive: true })
    writeFileSync(join(root, 'skills', slug, 'SKILL.md'), `---\nname: ${slug === 'alpha' || slug === 'beta' ? 'shared-name' : slug}\ndescription: Test ${slug}\n---\n\nBODY_${slug}\n`)
  }
  const policy = createEffectiveAgentPresetPolicy({ id: 'test', name: 'test', description: '', isBuiltin: false, createdAt: 0, updatedAt: 0, ...overrides }, { presetId: 'test', presetScope: 'workspace', workspaceSlug: 'ws' }, { runtimeSupportsSubagents: true, loadedMcpServerNames: ['automation', 'collaboration'] })
  return { root, policy, toolNames: tools, projection: { path: root, skills: skills.map(slug => ({ slug, name: slug, path: join(root, 'skills', slug), version: '1', scope: 'workspace' as const, actualSource: 'workspace' as const })), diagnostics: [] } }
}
async function snapshot(overrides: Partial<AgentPreset> = {}, tools: string[] = []): Promise<SkillRoutingSnapshot> {
  return createSkillRoutingSnapshot(fixture(overrides, tools))
}

describe('Skill 路由：权限先于相关性', () => {
  test('undefined 保留可用目录，[] 全禁；推荐不能扩权且不泄露正文', async () => {
    const unrestricted = await snapshot()
    expect(unrestricted.allowedSlugs).toContain('pdf')
    const closed = await snapshot({ skillSlugs: [] })
    const result = routeSkillsForTask(closed, { userMessage: '/skill:pdf 帮我合并 PDF 文件' })
    expect(closed.allowedSlugs).toEqual([])
    expect(result.recommended).toEqual([])
    expect(result.prompt).toContain('preset-denied')
    expect(result.prompt).not.toContain('BODY_pdf')
    expect(result.prompt).not.toContain('/skills/')
  })
  test('相同 name 不吞掉 slug，歧义别名不默认选择第一个', async () => {
    const all = await snapshot()
    expect(all.allowedSlugs).toEqual(expect.arrayContaining(['alpha', 'beta']))
    const result = routeSkillsForTask(all, { userMessage: '/skill:shared-name' })
    expect(result.diagnostics.some(d => d.code === 'ambiguous')).toBe(true)
    expect(result.prompt).not.toContain('BODY_')
    expect(routeSkillsForTask(all, { userMessage: '/skill:beta' }).prompt).toContain('BODY_beta')
  })
  test('显式数组与文本引用合并去重，不扫描历史或 quoted_context', async () => {
    const result = routeSkillsForTask(await snapshot(), { userMessage: '请处理 /skill:pdf\n<quoted_context>/skill:alpha</quoted_context>', mentionedSkills: ['pdf'] })
    expect(result.selected.map(s => s.slug)).toEqual(['pdf'])
    expect(result.prompt.match(/BODY_pdf/g)).toHaveLength(1)
  })
  test('不存在、未能读取都明确反馈，且不阻塞普通任务', async () => {
    const f = fixture()
    rmSync(join(f.root, 'skills', 'pdf', 'SKILL.md'))
    const s = await createSkillRoutingSnapshot(f)
    const result = routeSkillsForTask(s, { userMessage: '/skill:pdf /skill:missing' })
    expect(result.diagnostics.map(d => d.code)).toEqual(expect.arrayContaining(['unreadable', 'not-found']))
  })
  test('禁用 automation 组即使 Skill 白名单命中也不进入目录或正文', async () => {
    const s = await snapshot({ disabledToolGroups: ['automation'], skillSlugs: ['automation'] }, ['mcp__automation__create_automation'])
    expect(s.allowedSlugs).toEqual([])
    const result = routeSkillsForTask(s, { userMessage: '/skill:automation 每天检查项目' })
    expect(result.prompt).toContain('tool-group-disabled')
    expect(result.prompt).not.toContain('BODY_automation')
  })
  test('单工具禁用、MCP 白名单与实际工具缺失同样裁剪', async () => {
    const f = fixture({ disabledTools: ['fetch_report'], mcpServerNames: [] }, ['mcp__reports__fetch_report'])
    writeFileSync(join(f.root, 'skills', 'pdf', 'profer-routing.json'), JSON.stringify({ requiredTools: ['mcp__reports__fetch_report'], requiredMcpServers: ['reports'] }))
    const s = await createSkillRoutingSnapshot(f)
    expect(s.allowedSlugs).not.toContain('pdf')
    const missing = fixture()
    writeFileSync(join(missing.root, 'skills', 'pdf', 'profer-routing.json'), JSON.stringify({ requiredTools: ['fetch_report'] }))
    expect((await createSkillRoutingSnapshot(missing)).allowedSlugs).not.toContain('pdf')
  })
  test('侧车关键字驱动自定义 Skill，反例不触发；allowed-tools 不是依赖', async () => {
    const f = fixture()
    writeFileSync(join(f.root, 'skills', 'alpha', 'profer-routing.json'), JSON.stringify({ keywords: ['季度核算'], excludeKeywords: ['不要核算'] }))
    writeFileSync(join(f.root, 'skills', 'beta', 'SKILL.md'), '---\nname: beta\ndescription: beta\nallowed-tools: MissingTool\n---\nBODY_beta')
    const s = await createSkillRoutingSnapshot(f)
    expect(s.allowedSlugs).toContain('beta')
    expect(routeSkillsForTask(s, { userMessage: '请做季度核算' }).recommended.map(s => s.slug)).toContain('alpha')
    expect(routeSkillsForTask(s, { userMessage: '季度核算是什么，不要核算' }).recommended).toEqual([])
  })
  test('disable-model-invocation 禁止自动推荐，但显式引用可展开', async () => {
    const f = fixture()
    writeFileSync(join(f.root, 'skills', 'pdf', 'SKILL.md'), '---\nname: pdf\ndescription: pdf\ndisable-model-invocation: true\n---\nBODY_pdf')
    const s = await createSkillRoutingSnapshot(f)
    expect(routeSkillsForTask(s, { userMessage: '合并这些 PDF 文件' }).recommended).toEqual([])
    expect(routeSkillsForTask(s, { userMessage: '/skill:pdf' }).prompt).toContain('BODY_pdf')
  })
  test('队列复用快照，后续磁盘编辑不能改变本轮正文与策略', async () => {
    const f = fixture({ skillSlugs: ['pdf'] })
    const s = await createSkillRoutingSnapshot(f)
    writeFileSync(join(f.root, 'skills', 'pdf', 'SKILL.md'), 'CHANGED')
    const result = routeSkillsForTask(s, { userMessage: '/skill:pdf /skill:alpha' })
    expect(result.prompt).toContain('BODY_pdf')
    expect(result.prompt).not.toContain('CHANGED')
    expect(result.prompt).not.toContain('BODY_alpha')
  })
  test('正文超预算不截断半份规则，返回读取指引且保留可用目录', async () => {
    const s = await snapshot()
    const result = routeSkillsForTask(s, { userMessage: '/skill:pdf', maxBodyChars: 2 })
    expect(result.prompt).not.toContain('BODY_pdf')
    expect(result.prompt).toContain('budget-deferred')
    expect(result.prompt).toContain('SKILL.md')
    expect(s.allowedSlugs).toContain('pdf')
  })
})
