/**
 * AiClassCognitionButton — AI 速课堂「认知底座」右上角快捷入口胶囊
 *
 * 常驻于速课堂中间对话区域右上角，点击唤起场景化配置弹窗。
 * 挂载时从主进程 settings.json 水合当前双引擎选择，保证胶囊徽标与设置页实时一致。
 */

import * as React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Brain } from 'lucide-react'
import {
  cognitionModalOpenAtom,
  memoryRetrievalEngineAtom,
  studyRetrievalEngineAtom,
} from '@/atoms/study-retrieval-atoms'

export function AiClassCognitionButton(): React.ReactElement {
  const setModalOpen = useSetAtom(cognitionModalOpenAtom)
  const setStudyEngine = useSetAtom(studyRetrievalEngineAtom)
  const setMemoryEngine = useSetAtom(memoryRetrievalEngineAtom)
  const studyEngine = useAtomValue(studyRetrievalEngineAtom)
  const memoryEngine = useAtomValue(memoryRetrievalEngineAtom)
  const isEnhanced = studyEngine === 'graphrag' || memoryEngine === 'hipporag'

  // 挂载时从主进程设置水合当前引擎选择，保证多条入口状态同步
  React.useEffect(() => {
    let alive = true
    window.electronAPI
      .getSettings()
      .then((settings) => {
        if (!alive) return
        setStudyEngine(settings.studyRetrievalEngine === 'graphrag' ? 'graphrag' : 'classic')
        setMemoryEngine(settings.memoryRetrievalEngine === 'hipporag' ? 'hipporag' : 'classic')
      })
      .catch(() => {
        // 读取失败保持默认经典实现，不影响胶囊使用
      })
    return () => {
      alive = false
    }
  }, [setStudyEngine, setMemoryEngine])

  return (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className="absolute right-4 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-all hover:border-primary/50 hover:bg-card hover:text-primary active:scale-95"
    >
      <Brain size={13} className="text-primary" />
      <span>认知底座</span>
      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
        {isEnhanced ? '宏观演进+联想' : '经典精准'}
      </span>
    </button>
  )
}
