import { useEffect, useState } from 'react'

/**
 * 主题切换：经典（藏蓝红）/ 现代（紫夜）/ TVBox（电视端）。
 * 选择持久化在 localStorage 的 webtv_theme —— 故意不走 persist 的 IndexedDB 镜像：
 * 根节点属性要在首次渲染时同步读出（避免首帧闪错主题），localStorage 是唯一同步源。
 * 该键不带 tvbox_ 前缀，不会被 persist 的旧数据迁移清掉；也不与降级后端的
 * webtv_kv: / webtv_cache: 前缀冲突。
 */

export type WtTheme = 'classic' | 'modern' | 'tvbox'

const KEY = 'webtv_theme'

export function getTheme(): WtTheme {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'modern' || v === 'tvbox' ? v : 'classic'
  } catch {
    return 'classic'
  }
}

export function setTheme(theme: WtTheme): void {
  try {
    localStorage.setItem(KEY, theme)
  } catch { /* 忽略：本会话内仍可通过 applyTheme 生效 */ }
  applyTheme(theme)
  try {
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  } catch { /* 忽略 */ }
}

/** 主题变更事件：Shell 订阅它以便即时重渲染（导航栏布局随主题不同） */
export const THEME_CHANGE_EVENT = 'wt-theme-change'

/** React 侧订阅主题：Shell 的导航布局、Home 的站点选择位置随主题不同 */
export function useWtTheme(): WtTheme {
  const [theme, setT] = useState<WtTheme>(getTheme())
  useEffect(() => {
    const onChange = () => setT(getTheme())
    window.addEventListener(THEME_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange)
  }, [])
  return theme
}

/** 直接改根节点属性，即时生效（Shell 渲染时也会从 getTheme() 带上同样的值） */
export function applyTheme(theme: WtTheme): void {
  try {
    document.querySelector('.webtv-root')?.setAttribute('data-wt-theme', theme)
  } catch { /* 忽略 */ }
}
