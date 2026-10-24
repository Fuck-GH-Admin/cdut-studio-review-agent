/**
 * AI 速课堂「认知底座」双引擎状态 Atom
 *
 * 统一管理两组增强检索引擎的选择态与配置弹窗开关：
 *   - 课堂知识检索引擎（classic 精准查点 / graphrag 全书脉络）；
 *   - 跨课终身记忆引擎（classic 当堂专注 / hipporag 海马体联想）。
 *
 * 引擎取值与主进程 settings.json 一一对应，弹窗、入口胶囊与设置页共享同一原子源，
 * 实现实时同步；切换时经 Electron IPC 异步落盘，下一轮推理即刻生效。
 */

import { atom } from 'jotai'

export type StudyEngineType = 'classic' | 'graphrag'
export type MemoryEngineType = 'classic' | 'hipporag'

/** 课堂知识检索引擎（默认 classic 精准查点） */
export const studyRetrievalEngineAtom = atom<StudyEngineType>('classic')

/** 跨课终身记忆引擎（默认 classic 当堂专注） */
export const memoryRetrievalEngineAtom = atom<MemoryEngineType>('classic')

/** 认知底座设置弹窗开关 */
export const cognitionModalOpenAtom = atom<boolean>(false)
