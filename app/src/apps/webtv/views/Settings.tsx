import { useCallback, useEffect, useState } from 'react'
import { useSources } from '../components/SourcesProvider'
import { addSubscription, enableSitePersist, getDisabledSites, removeSubscription } from '../lib/sources'
import {
  loadFrozenParseIds,
  loadSubscriptions,
  unfreezeParse,
  type SubscriptionEntry,
} from '../lib/localStats'
import { showToast } from '../lib/toast'
import type { TvSite } from '../lib/types'

/**
 * 设置页（上游为纯本地实现）：订阅管理（添加/移除 TVBox 配置 URL）、
 * 已禁用站点恢复、已冻结解析线路恢复。
 */
export default function Settings() {
  const { reload } = useSources()
  const [subs, setSubs] = useState<SubscriptionEntry[]>([])
  const [disabledSites, setDisabledSites] = useState<TvSite[]>([])
  const [frozenParses, setFrozenParses] = useState<string[]>([])
  const [url, setUrl] = useState('')
  const [adding, setAdding] = useState(false)

  const refresh = useCallback(() => {
    setSubs(loadSubscriptions())
    setDisabledSites(getDisabledSites())
    setFrozenParses(loadFrozenParseIds())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleAdd = async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    setAdding(true)
    try {
      const result = await addSubscription(trimmed)
      showToast(`订阅成功：${result.name}（${result.added} 条源）`, 'ok')
      setUrl('')
      reload()
      refresh()
    } catch (e) {
      showToast(e instanceof Error ? e.message : '订阅失败', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = (id: string) => {
    removeSubscription(id)
    reload()
    refresh()
    showToast('订阅已移除', 'ok')
  }

  const handleRestoreSite = (id: string) => {
    enableSitePersist(id)
    reload()
    refresh()
    showToast('站点已恢复', 'ok')
  }

  const handleUnfreezeParse = (id: string) => {
    unfreezeParse(id)
    reload()
    refresh()
    showToast('线路已恢复', 'ok')
  }

  const itemStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' } as const

  return (
    <section className="content-area" style={{ maxWidth: 860 }}>
      <div className="page-title"><span>设置</span></div>

      {/* 订阅管理 */}
      <div style={{ background: '#16213e', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>TVBox 订阅</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            className="search-box"
            style={{ flex: 1 }}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="输入 TVBox 配置订阅地址（如 https://.../4k.json）"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          />
          <button className="btn-search" onClick={handleAdd} disabled={adding || !url.trim()}>
            {adding ? '添加中...' : '添加订阅'}
          </button>
        </div>
        {subs.length === 0 ? (
          <div style={{ color: '#666', fontSize: 13 }}>暂无订阅（内置预置源已可用）</div>
        ) : (
          subs.map((sub) => (
            <div key={sub.id} style={itemStyle}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 14 }}>{sub.name}</div>
                <div style={{ color: '#666', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.url}</div>
              </div>
              <button className="text-btn" onClick={() => handleRemove(sub.id)}>移除</button>
            </div>
          ))
        )}
      </div>

      {/* 已禁用站点 */}
      <div style={{ background: '#16213e', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>已禁用站点（连续失败自动禁用）</div>
        {disabledSites.length === 0 ? (
          <div style={{ color: '#666', fontSize: 13 }}>无</div>
        ) : (
          disabledSites.map((s) => (
            <div key={s.id} style={itemStyle}>
              <span style={{ fontSize: 14 }}>{s.name}</span>
              <button className="text-btn" onClick={() => handleRestoreSite(s.id)}>恢复</button>
            </div>
          ))
        )}
      </div>

      {/* 已冻结解析线路 */}
      <div style={{ background: '#16213e', borderRadius: 10, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>已冻结解析线路（报错达到阈值）</div>
        {frozenParses.length === 0 ? (
          <div style={{ color: '#666', fontSize: 13 }}>无</div>
        ) : (
          frozenParses.map((id) => (
            <div key={id} style={itemStyle}>
              <span style={{ fontSize: 14 }}>{id}</span>
              <button className="text-btn" onClick={() => handleUnfreezeParse(id)}>恢复</button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
