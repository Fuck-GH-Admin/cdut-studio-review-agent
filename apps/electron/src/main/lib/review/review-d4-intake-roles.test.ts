import { describe, expect, test } from 'bun:test'
import { resolveD4IntakeRoles } from './review-d4-intake-roles'

describe('W1 native-picked document role fence', () => {
  test('omission retains the legacy all-application import contract', () => {
    expect(resolveD4IntakeRoles(3, undefined)).toEqual(['application','application','application'])
  })
  test('application and evidence may be mixed in native picker order', () => {
    const source = ['evidence','application'] as const
    const roles = resolveD4IntakeRoles(2, source.slice())
    expect(roles).toEqual(['evidence', 'application'])
    roles[0] = 'application'
    expect(source[0]).toBe('evidence')
  })
  test('policy/rule and arbitrary role injection never become authorities', () => {
    expect(() => resolveD4IntakeRoles(1, ['rule'])).toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
    expect(() => resolveD4IntakeRoles(1, ['attachment'])).toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
    expect(() => resolveD4IntakeRoles(1, ['policy'])).toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
  })
  test('mismatched or incomplete file count is rejected', () => {
    expect(() => resolveD4IntakeRoles(2, ['application'])).toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
    expect(() => resolveD4IntakeRoles(1, ['application','evidence'])).toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
  })
  test('reject nonarray, malformed and out-of-bounds staged file counts', () => {
    expect(() => resolveD4IntakeRoles(1, 'application')).toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
    expect(() => resolveD4IntakeRoles(0, [])).toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
    expect(() => resolveD4IntakeRoles(101, undefined)).toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
    expect(() => resolveD4IntakeRoles(1.5, undefined)).toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
  })
})
