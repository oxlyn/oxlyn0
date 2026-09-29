
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { TvLive, TvParse, TvSite } from '../lib/types';
import { getAllLives, getAllParses, getAllSites } from '../lib/sources';
import { preloadPlayer } from './LazyPlayer';
import {
  disableSite as persistDisableSite,
  loadLastSiteId,
  loadSkipCounts,
  reportParseError as persistReportParseError,
  resetSkipCount as persistResetSkip,
  saveLastSiteId,
} from '../lib/localStats';

/**
 * 全局源状态：等价原版 app.js 的 app 级 sites/lives/parses 加载与禁用逻辑。
 * 无服务端 —— 禁用/冻结全部落在 localStorage。
 */

interface SourcesValue {
  ready: boolean;
  sites: TvSite[];
  lives: TvLive[];
  parses: TvParse[];
  currentSiteId: string | null;
  setCurrentSiteId: (id: string) => void;
  /** 重新从 presets+localStorage 读取源列表 */
  reload: () => void;
  /** 站点请求失败：累加跳过计数，达阈值自动禁用并返回 true */
  failSite: (siteId: string) => boolean;
  /** 站点加载成功：清零跳过计数 */
  succeedSite: (siteId: string) => void;
  /** 解析接口报错（本地计数冻结），返回 {frozen} */
  reportParseError: (parseId: string, type: 'play' | 'parse') => { frozen: boolean };
}

const SourcesContext = createContext<SourcesValue | null>(null);

export function useSources(): SourcesValue {
  const ctx = useContext(SourcesContext);
  if (!ctx) throw new Error('useSources 必须在 SourcesProvider 内使用');
  return ctx;
}

export function SourcesProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sites, setSites] = useState<TvSite[]>([]);
  const [lives, setLives] = useState<TvLive[]>([]);
  const [parses, setParses] = useState<TvParse[]>([]);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);

  // 首次交互（点击/按键）就开始预热播放器 chunk。
  // 不放在挂载时：那会和首页详情/分类请求抢同一批连接，拖慢首屏。
  useEffect(() => {
    const warmUp = () => {
      void preloadPlayer()
      window.removeEventListener('pointerdown', warmUp)
      window.removeEventListener('keydown', warmUp)
    }
    window.addEventListener('pointerdown', warmUp)
    window.addEventListener('keydown', warmUp)
    return () => {
      window.removeEventListener('pointerdown', warmUp)
      window.removeEventListener('keydown', warmUp)
    }
  }, [])

  const reload = useCallback(() => {
    const nextSites = getAllSites();
    setSites(nextSites);
    setLives(getAllLives());
    setParses(getAllParses());
    // 恢复上次使用的源；该源已被移除/禁用时回落到第一个
    setCurrentSiteId((prev) => {
      if (prev) return prev;
      const saved = loadLastSiteId();
      if (saved && nextSites.some((s) => s.id === saved)) return saved;
      return nextSites[0]?.id ?? null;
    });
  }, []);

  // 记住当前源，下次打开直接回到它
  useEffect(() => {
    if (currentSiteId) saveLastSiteId(currentSiteId);
  }, [currentSiteId]);

  useEffect(() => {
    // 初始加载时把已达禁用阈值的计数直接落为禁用（对齐原版 loadSites 的阈值过滤）
    const counts = loadSkipCounts();
    for (const [siteId, count] of Object.entries(counts)) {
      if (count >= 3) persistDisableSite(siteId);
    }
    reload();
    setReady(true);
  }, [reload]);

  const failSite = useCallback(
    (siteId: string): boolean => {
      const counts = loadSkipCounts();
      const next = (counts[siteId] || 0) + 1;
      if (next >= 3) {
        persistDisableSite(siteId); // 内部会清掉计数
        setSites((prev) => {
          const remaining = prev.filter((s) => s.id !== siteId);
          setCurrentSiteId((cur) => (cur === siteId ? remaining[0]?.id ?? null : cur));
          return remaining;
        });
        return true;
      }
      counts[siteId] = next;
      try {
        localStorage.setItem('tvbox_site_skip_counts', JSON.stringify(counts));
      } catch { /* 忽略 */ }
      return false;
    },
    []
  );

  const succeedSite = useCallback((siteId: string) => {
    persistResetSkip(siteId);
  }, []);

  const reportParseError = useCallback((parseId: string, type: 'play' | 'parse') => {
    const result = persistReportParseError(parseId, type);
    if (result.frozen) {
      // 冻结后刷新可用线路列表
      setParses(getAllParses());
    }
    return { frozen: result.frozen };
  }, []);

  const value = useMemo<SourcesValue>(
    () => ({
      ready,
      sites,
      lives,
      parses,
      currentSiteId,
      setCurrentSiteId,
      reload,
      failSite,
      succeedSite,
      reportParseError,
    }),
    [ready, sites, lives, parses, currentSiteId, reload, failSite, succeedSite, reportParseError]
  );

  return <SourcesContext.Provider value={value}>{children}</SourcesContext.Provider>;
}
