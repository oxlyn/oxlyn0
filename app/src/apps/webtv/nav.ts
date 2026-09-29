/**
 * 窗口内导航：替代上游 webtv 的 Next.js 路由（/、/search?kw=、/live、/parse?url=、
 * /settings、/detail/[siteId]/[movieId]）—— 桌面窗口里用页面栈表达。
 */
export type WebTVView =
  | { page: 'home' }
  | { page: 'search'; kw?: string }
  | { page: 'live' }
  | { page: 'parse'; url?: string }
  | { page: 'settings' }
  | { page: 'detail'; siteId: string; movieId: string; from: 'home' | 'search' | 'favorites'; kw?: string }

export interface WebTVNav {
  /** 压栈跳转（返回键由 shell 出栈） */
  open: (view: WebTVView) => void
  back: () => void
}
