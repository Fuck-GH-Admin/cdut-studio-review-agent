import { afterEach, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { preparePolicyRuntimeSkills } from './global-skill-manager'
const roots: string[] = []
afterEach(() => { for (const path of roots.splice(0)) rmSync(path, { recursive: true, force: true }) })
test('策略投影先裁剪再提供 Claude/Pi，空集合不回退，源目录不变', () => {
  const root = mkdtempSync(join(tmpdir(), 'profer-policy-projection-'))
  roots.push(root)
  const sourcePath = join(root, 'source')
  const skills = ['alpha', 'beta'].map(slug => {
    const path = join(sourcePath, 'skills', slug)
    mkdirSync(path, { recursive: true })
    writeFileSync(join(path, 'SKILL.md'), `---\nname: shared-name\ndescription: test\n---\nBODY_${slug}`)
    writeFileSync(join(path, 'resource.txt'), slug)
    return { slug, name: 'shared-name', version: '1', path, scope: 'workspace' as const, actualSource: 'workspace' as const }
  })
  const source = { path: sourcePath, skills, diagnostics: [] }
  const one = preparePolicyRuntimeSkills(source, ['beta'])
  const none = preparePolicyRuntimeSkills(source, [])
  expect(existsSync(join(one.path, 'skills', 'alpha'))).toBe(false)
  expect(readFileSync(join(one.path, 'skills', 'beta', 'SKILL.md'), 'utf8')).toContain('name: "beta"')
  expect(readFileSync(join(one.path, 'skills', 'beta', 'resource.txt'), 'utf8')).toBe('beta')
  expect(one.skills.map(s => s.slug)).toEqual(['beta'])
  expect(none.skills).toEqual([])
  expect(existsSync(join(none.path, 'skills'))).toBe(true)
  expect(readFileSync(join(sourcePath, 'skills', 'beta', 'SKILL.md'), 'utf8')).toContain('name: shared-name')
  expect(preparePolicyRuntimeSkills(source, ['beta']).path).toBe(one.path)
  expect(JSON.parse(readFileSync(join(one.path, '.claude-plugin', 'plugin.json'), 'utf8')).name).toMatch(/^profer-skills-/)
})
