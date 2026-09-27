'use client';

/**
 * 轻量 Toast：等价移植原版 app.js 的 showToast（事件 + 单例 DOM），供任意组件调用。
 */

export type ToastType = 'ok' | 'error' | 'warn';

export function showToast(msg: string, type: ToastType = 'ok'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('tvbox-toast', { detail: { msg, type } }));
}
