import { useEffect, useState } from 'react'
import { showToast, type ToastType } from '../lib/toast'

interface ToastItem {
  id: number
  msg: string
  type: ToastType
}

/**
 * 监听 tvbox-toast 事件并渲染提示（等价原版 showToast 的单例 DOM）。
 * 桌面窗口版：absolute 定位在应用窗口内居中，不再盖住整个浏览器视口。
 */
export default function Toast() {
  const [toast, setToast] = useState<ToastItem | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ msg: string; type: ToastType }>).detail
      setToast({ id: Date.now(), msg: detail.msg, type: detail.type })
      setVisible(true)
      clearTimeout(timer)
      timer = setTimeout(() => setVisible(false), 2000)
    }
    window.addEventListener('tvbox-toast', handler)
    return () => {
      window.removeEventListener('tvbox-toast', handler)
      clearTimeout(timer)
    }
  }, [])

  if (!toast) return null

  const bg = toast.type === 'error' ? 'rgba(233,69,96,0.92)' : toast.type === 'warn' ? 'rgba(255,165,0,0.92)' : 'rgba(0,0,0,0.78)'
  return (
    <div
      style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 9999, padding: '12px 28px', borderRadius: 8, fontSize: 15, maxWidth: 380,
        textAlign: 'center', color: '#fff', lineHeight: 1.5, pointerEvents: 'none',
        transition: 'opacity 0.25s', opacity: visible ? 1 : 0, background: bg,
      }}
    >
      {toast.msg}
    </div>
  )
}

export { showToast }
