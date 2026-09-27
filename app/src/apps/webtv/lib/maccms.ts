import type { PlayLine, VodItem } from './types';

/**
 * 苹果CMS 数据纯函数：从原版 app.js（102-229 行）等价移植，不依赖 DOM。
 */

/**
 * 解析 vod_play_from + vod_play_url，拆分为线路 + 剧集
 * playFrom: "线路1$$$线路2"
 * playUrl:  "第1集$url1#第2集$url2$$$第1集$url3"
 */
export function parsePlayData(playFrom: string | undefined, playUrl: string | undefined): PlayLine[] {
  if (!playUrl) return [];
  const lineNames = (playFrom || '').split('$$$');
  const rawLines = playUrl.split('$$$');
  const lines: PlayLine[] = [];
  rawLines.forEach((raw, idx) => {
    if (!raw || !raw.trim()) return;
    const eps: PlayLine['episodes'] = [];
    const segs = raw.split('#');
    segs.forEach((seg) => {
      if (!seg) return;
      const dollarPos = seg.lastIndexOf('$');
      let title: string;
      let url: string;
      if (dollarPos === -1) {
        // 无 $ 分隔，整段当作地址
        if (seg.startsWith('http')) {
          title = `第${eps.length + 1}集`;
          url = seg;
        } else {
          return;
        }
      } else {
        title = seg.substring(0, dollarPos) || `第${eps.length + 1}集`;
        url = seg.substring(dollarPos + 1);
      }
      if (url) eps.push({ title, url });
    });
    if (eps.length > 0) {
      lines.push({ name: lineNames[idx] || `线路${idx + 1}`, episodes: eps });
    }
  });
  return lines;
}

/** m3u8 用 hls.js；mp4/其他视频格式 video 直连；其他地址需要走解析接口 */
export function isDirectPlayable(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().split('?')[0].split('#')[0];
  return (
    lower.endsWith('.m3u8') || lower.endsWith('.mp4') ||
    lower.endsWith('.flv') || lower.endsWith('.webm') || lower.endsWith('.mkv')
  );
}

export function isM3U8(url: string | undefined): boolean {
  if (!url) return false;
  return url.toLowerCase().split('?')[0].endsWith('.m3u8');
}

/**
 * 从解析接口响应中提取真实播放地址
 * 兼容：{url} / {data:{url}} / {data:"url"} / {playUrl} / 纯文本正则提取
 */
export function extractParseUrl(data: unknown): string {
  if (!data) return '';
  if (typeof data === 'string') return data.trim();
  const d = data as Record<string, unknown>;
  if (typeof d.__raw === 'string' && d.__raw) {
    const m = d.__raw.match(/https?:\/\/[^\s"'<>]+/i);
    return m ? m[0] : '';
  }
  if (typeof d.url === 'string' && d.url) return d.url;
  if (d.data && typeof d.data === 'object') {
    const inner = d.data as Record<string, unknown>;
    if (typeof inner.url === 'string' && inner.url) return inner.url;
  }
  if (typeof d.data === 'string' && d.data) return d.data;
  if (typeof d.playUrl === 'string' && d.playUrl) return d.playUrl;
  return '';
}

/** 构建解析页 iframe 地址（原版 buildParseUrl） */
export function buildParseIframeUrl(
  parse: { url: string; ext: string | null },
  targetUrl: string
): string {
  // 去除尾部已有的 ?url= 或 &url=，避免重复
  const cleanUrl = parse.url.replace(/(\?|&)url=$/, '');
  const separator = cleanUrl.indexOf('?') > -1 ? '&' : '?';
  let result = `${cleanUrl}${separator}url=${encodeURIComponent(targetUrl)}`;
  if (parse.ext) {
    try {
      const extData = JSON.parse(parse.ext);
      // 兼容 params / headers 两种键（原版代理只认 params，种子里是 header）
      const params = extData.params || extData.header;
      if (params && typeof params === 'object') {
        for (const [key, val] of Object.entries(params)) {
          result += `&${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`;
        }
      }
    } catch {
      // ext JSON 解析失败，静默忽略
    }
  }
  return result;
}

/** 拼接苹果CMS API 请求地址（保留 api 自带查询参数） */
export function buildMacCmsUrl(api: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(api);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.set(key, String(val));
    }
  }
  return url.toString();
}

/** 从 ac=type 响应提取分类列表 */
export function extractCategories(data: Record<string, unknown>): Array<{ type_id: string | number; type_name: string }> {
  const classList =
    (data.class as Array<{ type_id: string | number; type_name: string }>) ||
    ((data.data as Record<string, unknown>)?.class as Array<{ type_id: string | number; type_name: string }>) ||
    [];
  return classList.map((c) => ({ type_id: c.type_id, type_name: c.type_name }));
}

/** 判断响应是否为站点不可达类错误（触发自动切换/禁用） */
export function isSiteUnreachable(data: Record<string, unknown>): boolean {
  return data.error_type === 'site_unreachable' || data.error_type === 'site_not_http_api';
}

/** 响应解析兜底：非 JSON 时返回 {__raw} 分支（原版 fetchJson 语义） */
export async function fetchJsonLenient(url: string, options?: RequestInit): Promise<Record<string, unknown>> {
  const resp = await fetch(url, options);
  const text = await resp.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { __raw: text, __status: resp.status } as Record<string, unknown>;
  }
}

/** vod 列表响应的宽松判断（code 0/1 均算成功） */
export function extractVodList(data: Record<string, unknown>): { list: VodItem[]; pagecount: number; total: number } {
  if ((data.code === 1 || data.code === 0) && Array.isArray(data.list)) {
    return {
      list: data.list as VodItem[],
      pagecount: parseInt(String(data.pagecount ?? '1'), 10) || 1,
      total: parseInt(String(data.total ?? '0'), 10) || 0,
    };
  }
  return { list: [], pagecount: 1, total: 0 };
}
