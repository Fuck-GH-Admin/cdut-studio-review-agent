/**
 * CdutZoneView — CDUT 专区主界面
 *
 * 结构：顶栏（学士帽图标 + 「特区账户」徽章 + 拖拽区） + 主视图。
 * - 未登录态：左右分栏大师级布局 —— 左侧品牌愿景与三大核心能力矩阵，
 *   右侧一体化登录悬浮卡片（学工号 / 密码 / 记住密码，后台静默提交 CAS）。
 * - 已登录态：精致详情页，展示真实头像、姓名、学工号、学院、专业与绿色在线脉冲灯，
 *   并提供【退出特区账户】。
 *
 * 如实标注：状态 `active` 表示最近一次认证成功且后台静默保活心跳正常；
 * 本客户端不嗅探内网 Cookie，密码仅在勾选时经 OS 级加密落盘。
 */

import * as React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  Building2,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { CdutSavedAccountSummary } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { Input } from '@profer/ui/primitives/input'
import { ConfirmDialog } from '@profer/ui/primitives/confirm-dialog'
import { cdutAccountAtom } from '@/atoms/cdut-account-atoms'
import { MutationConfirmModal } from './MutationConfirmModal'

/** 未登录态：专区三大核心能力矩阵展示 */
const CAPABILITY_CARDS = [
  {
    icon: CalendarDays,
    title: '课表与日程助理',
    desc: '自动同步学期课程表，智能问答上课地点与明日安排',
  },
  {
    icon: GraduationCap,
    title: '学业绩点与报告',
    desc: '全学期成绩单透视、GPA 分析与学分进度一键掌握',
  },
  {
    icon: Building2,
    title: '自习空教室检索',
    desc: '覆盖成都/宜宾校区，按教学楼智能检索空闲自习室',
  },
] as const

/** 已登录态：4 大高频场景快捷卡片 */
const QUICK_ACTIONS = [
  {
    icon: CalendarDays,
    title: '今日课表',
    desc: '查看今日课程、节次、教室与任课教师',
    hint: '我今天有哪些课',
  },
  {
    icon: GraduationCap,
    title: '成绩与 GPA',
    desc: '历学期成绩单透视、学分与绩点加权分析',
    hint: '查一下我的成绩单',
  },
  {
    icon: Building2,
    title: '自习空教室',
    desc: '成都/宜宾校区按教学楼与节次检索空教室',
    hint: '今天下午6教有没有空教室',
  },
  {
    icon: ClipboardList,
    title: '期末考场',
    desc: '期末考试时间、考场教室、座位号与准考证号',
    hint: '我的期末考试安排',
  },
] as const

export function CdutZoneView(): React.ReactElement {
  const account = useAtomValue(cdutAccountAtom)
  const setAccount = useSetAtom(cdutAccountAtom)

  // 登录表单状态
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberPassword, setRememberPassword] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)

  // 本地已保存的特区账户（登录窗一键填充引导）
  const [savedAccount, setSavedAccount] = React.useState<CdutSavedAccountSummary | null>(null)
  const [showSavedCard, setShowSavedCard] = React.useState(true)

  const isConnected = account.status === 'active'

  // 订阅主进程状态推送，并在挂载时拉取一次当前状态
  React.useEffect(() => {
    let active = true
    window.electronAPI.cdutZone
      .getAccount()
      .then((p) => {
        if (active) setAccount(p)
      })
      .catch(() => {
        /* 拉取失败保持默认未连接态 */
      })

    const unsub = window.electronAPI.cdutZone.onStatusChanged((p) => {
      setAccount(p)
    })
    return () => {
      active = false
      unsub()
    }
  }, [setAccount])

  // 挂载时拉取本地已保存的特区账户，用于顶部「一键填充」名片
  React.useEffect(() => {
    let active = true
    window.electronAPI.cdutZone
      .getSavedAccount()
      .then((summary) => {
        if (active && summary.hasSaved) setSavedAccount(summary)
      })
      .catch(() => {
        /* 无已保存账户时保持纯输入模式 */
      })
    return () => {
      active = false
    }
  }, [])

  /** 统一的登录执行内核，供手动提交与「一键填充并登录」共用 */
  const performLogin = async (
    loginId: string,
    loginPassword: string,
    remember: boolean,
  ): Promise<void> => {
    setSubmitting(true)
    setErrorMessage('')
    try {
      const res = await window.electronAPI.cdutZone.login({
        username: loginId.trim(),
        password: loginPassword,
        rememberPassword: remember,
      })
      if (!res.success) {
        setErrorMessage(res.error || '登录失败，请核对学工号与密码')
      } else if (res.profile) {
        setAccount(res.profile)
      }
    } catch (err) {
      setErrorMessage('请求异常: ' + (err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setErrorMessage('请输入学工号和登录密码')
      return
    }
    await performLogin(username, password, rememberPassword)
  }

  /** 一键填充并登录：从已保存账户注入凭证并直接提交 */
  const handleOneClickLogin = async (): Promise<void> => {
    if (!savedAccount?.studentId) return
    const loginId = savedAccount.studentId
    const loginPassword = savedAccount.savedPassword ?? ''
    const remember = savedAccount.rememberPassword ?? true

    setUsername(loginId)
    setRememberPassword(remember)

    if (!loginPassword) {
      // 未保存密码：仅填充学工号，提示用户补充密码
      setShowSavedCard(false)
      setErrorMessage('已填充学工号，请补充登录密码后点击连接')
      return
    }

    setPassword(loginPassword)
    await performLogin(loginId, loginPassword, remember)
  }

  /** 切换其他账号：隐藏名片并清空表单，回到纯输入模式 */
  const handleSwitchAccount = (): void => {
    setShowSavedCard(false)
    setUsername('')
    setPassword('')
    setErrorMessage('')
  }

  const handleLogout = async (): Promise<void> => {
    setLoggingOut(true)
    try {
      await window.electronAPI.cdutZone.logout()
      setAccount({ studentId: '', studentName: '', status: 'disconnected' })
      setLogoutOpen(false)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-content-area">
      {/* 标题栏拖拽区 */}
      <div className="absolute inset-x-0 top-0 z-0 h-14 titlebar-drag-region" aria-hidden="true" />

      {/* 顶栏：左侧学士帽图标 + 放大后的特区账户标签 */}
      <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-border/60 bg-card/80 px-5 py-3 titlebar-no-drag backdrop-blur-sm">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
          <GraduationCap size={18} />
        </div>
        <span className="text-sm font-semibold tracking-tight">CDUT 专区</span>
        <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
          特区账户
        </span>
      </header>

      {/* 主视图 */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        {!isConnected ? (
          /* ================= 未登录：左右分栏大师级布局 ================= */
          <div className="mx-auto flex h-full min-h-[600px] w-full max-w-6xl items-center justify-center p-8">
            <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
              {/* 左侧：品牌愿景与能力矩阵 (占 7 栏) */}
              <div className="space-y-8 lg:col-span-7">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                    <Sparkles size={13} />
                    <span>成都理工大学 · 智慧校园专区</span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    开启您的专属内网智能体
                  </h1>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    深度连接校内统一身份认证与青果教务系统，为每一位 CDUT
                    师生打造专属的内网 AI 助理 —— 自动课表同步、学业绩点透视、自习空教室极速检索与考务报名自动化。
                  </p>
                </div>

                {/* 核心特性卡片 */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {CAPABILITY_CARDS.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-surface-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm"
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon size={16} />
                      </div>
                      <h4 className="mt-3 text-xs font-semibold text-foreground">{item.title}</h4>
                      <p className="mt-1 text-[11px] leading-normal text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 本地安全承诺 */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>
                    凭据与密码经操作系统 safeStorage 本地加密落盘，绝不上云，保护师生隐私。
                  </span>
                </div>
              </div>

              {/* 右侧：已保存账户名片 + 一体化登录悬浮卡片 (占 5 栏) */}
              <div className="space-y-4 lg:col-span-5">
                {/* 已保存特区账户名片：一键填充并登录 / 切换其他账号 */}
                {savedAccount && showSavedCard ? (
                  <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-lg shadow-primary/5">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-primary">
                      <ShieldCheck size={13} />
                      <span>已保存特区账户</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-primary/5">
                        {savedAccount.avatar ? (
                          <img
                            src={savedAccount.avatar}
                            alt="已保存账户头像"
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-primary/40">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {savedAccount.studentName || savedAccount.studentId}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          学工号：{savedAccount.studentId}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={submitting}
                        onClick={handleOneClickLogin}
                        className="h-8 flex-1 gap-1.5 text-xs font-semibold"
                      >
                        <LogIn size={13} />
                        <span>一键填充并登录</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={submitting}
                        onClick={handleSwitchAccount}
                        className="h-8 gap-1.5 px-3 text-xs"
                      >
                        <User size={13} />
                        <span>切换其他账号</span>
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="relative rounded-2xl border border-border/80 bg-card p-7 shadow-xl shadow-primary/5">
                  <div className="mb-6 space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">连接内网统一身份认证</h3>
                    <p className="text-xs text-muted-foreground">
                      输入您的学工号和密码，完成特区账户接入
                    </p>
                  </div>

                  {errorMessage ? (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  ) : null}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">学工号</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="请输入学工号 / 账号"
                          className="h-9 pl-9 text-xs"
                          value={username}
                          disabled={submitting}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">登录密码</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="请输入登录密码"
                          className="h-9 pl-9 pr-9 text-xs"
                          value={password}
                          disabled={submitting}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={rememberPassword}
                          onChange={(e) => setRememberPassword(e.target.checked)}
                          className="rounded border-border accent-primary"
                        />
                        <span>记住密码（OS 级安全加密）</span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="mt-2 h-10 w-full gap-2 text-xs font-semibold shadow-md"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>正在连接 CDUT 内网认证…</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={14} />
                          <span>一键连接特区账户</span>
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= 已登录：精致特区详情页 ================= */
          <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
            {/* 常驻特区账户卡片（含头像、姓名、学号、学院、专业） */}
            <section className="relative overflow-hidden rounded-2xl border border-surface-border/70 bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-6">
                {/* 左半部分：真实头像与详细画像 */}
                <div className="flex items-center gap-5">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/20 bg-primary/5 shadow-inner">
                    {account.avatar ? (
                      <img src={account.avatar} alt="头像" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-primary/40">
                        <User size={30} />
                      </div>
                    )}
                    {/* 绿色在线脉冲小圆点 */}
                    <span className="absolute bottom-1 right-1 size-3.5 rounded-full border-2 border-card bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold tracking-tight text-foreground">
                        {account.studentName}
                      </h2>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        内网会话在线
                      </span>
                      {account.role ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {account.role}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>学工号: {account.studentId || '—'}</span>
                      <span>学院: {account.college || '—'}</span>
                      <span>专业: {account.major || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 右半部分：操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 px-3 text-xs"
                    onClick={() => setLogoutOpen(true)}
                  >
                    <LogOut size={13} />
                    <span>退出特区账户</span>
                  </Button>
                </div>
              </div>
            </section>

            {/* Agent 准备就绪横幅 */}
            <section className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">特区专属 Agent 准备就绪</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  内网数据通道已建立，每 10
                  分钟自动静默保活。可直接用自然语言调度课表、成绩、空教室与考务等 8 大教务业务域。
                </p>
              </div>
            </section>

            {/* 4 大高频场景快捷卡片 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_ACTIONS.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-surface-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <card.icon size={16} />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.desc}</p>
                  <div className="mt-4 inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    对 AI 说「{card.hint}」
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 写操作二次确认浮层（常驻挂载，全局监听主进程派发） */}
      <MutationConfirmModal />

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="退出特区账户？"
        description="退出将清除本地持久化的加密凭据并停止后台保活定时器，确认退出？"
        confirmLabel="确认退出"
        loadingLabel="正在退出…"
        loading={loggingOut}
        onConfirm={handleLogout}
      />
    </div>
  )
}
