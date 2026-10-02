/**
 * AccountSettings - 账户与个人资料
 *
 * 集中管理本地用户档案、团队账户会话和登录状态。
 */

import * as React from 'react'
import { useAtom } from 'jotai'
import { Camera, ImagePlus } from 'lucide-react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { SettingsSection, SettingsCard } from './primitives'
import { Popover, PopoverTrigger, PopoverContent } from '@profer/ui/primitives/popover'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { userProfileAtom } from '@/atoms/user-profile'
import { cn } from '@/lib/utils'

interface EmojiMartEmoji {
  id: string
  name: string
  native: string
  unified: string
  keywords: string[]
  shortcodes: string
}

export function AccountSettings(): React.ReactElement {
  const [userProfile, setUserProfile] = useAtom(userProfileAtom)
  const [isEditingName, setIsEditingName] = React.useState(false)
  const [nameInput, setNameInput] = React.useState(userProfile.userName)
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleAvatarChange = async (avatar: string): Promise<void> => {
    try {
      const updated = await window.electronAPI.updateUserProfile({ avatar })
      setUserProfile(updated)
      setShowEmojiPicker(false)
    } catch (error) {
      console.error('[账户设置] 更新头像失败:', error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      await handleAvatarChange(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSaveName = async (): Promise<void> => {
    const trimmed = nameInput.trim()
    if (!trimmed) return

    try {
      const updated = await window.electronAPI.updateUserProfile({ userName: trimmed })
      setUserProfile(updated)
      setIsEditingName(false)
    } catch (error) {
      console.error('[账户设置] 更新用户名失败:', error)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      void handleSaveName()
    } else if (e.key === 'Escape') {
      setNameInput(userProfile.userName)
      setIsEditingName(false)
    }
  }



  return (
    <div className="space-y-6">
      <SettingsSection title="个人资料" description="设置头像和显示名称，这些信息只保存在本机">
        <SettingsCard>
          <div className="flex items-center gap-5 px-4 py-4">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <div className="relative group/avatar cursor-pointer">
                  <UserAvatar avatar={userProfile.avatar} size={64} />
                  <div className={cn(
                    'absolute inset-0 rounded-[20%] flex items-center justify-center',
                    'bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity'
                  )}>
                    <Camera className="size-5 text-white" />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" sideOffset={12} className="w-auto p-0 border-none shadow-xl">
                <Picker
                  data={data}
                  onEmojiSelect={(emoji: EmojiMartEmoji) => void handleAvatarChange(emoji.native)}
                  locale="zh"
                  theme="auto"
                  previewPosition="none"
                  skinTonePosition="search"
                  perLine={8}
                />
                <div className="px-3 p-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px]',
                      'text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors'
                    )}
                  >
                    <ImagePlus className="size-4" />
                    上传自定义图片
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={() => void handleSaveName()}
                  onKeyDown={handleNameKeyDown}
                  maxLength={30}
                  autoFocus
                  className={cn(
                    'text-lg font-semibold text-foreground bg-transparent border-b-2 border-primary',
                    'outline-none w-full max-w-[200px] pb-0.5'
                  )}
                />
              ) : (
                <button
                  onClick={() => {
                    setNameInput(userProfile.userName)
                    setIsEditingName(true)
                  }}
                  className="text-lg font-semibold text-foreground hover:text-primary transition-colors text-left"
                >
                  {userProfile.userName}
                </button>
              )}
              <p className="text-[12px] text-foreground/40 mt-0.5">点击头像更换，点击名字编辑</p>
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
