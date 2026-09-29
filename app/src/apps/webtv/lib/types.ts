/** 苹果CMS vod 条目（上游 API 返回的字段保持 snake_case 原样使用） */
export interface VodItem {
  vod_id: number | string;
  vod_name?: string;
  vod_pic?: string;
  vod_remarks?: string;
  vod_year?: string;
  vod_area?: string;
  vod_class?: string;
  vod_director?: string;
  vod_actor?: string;
  vod_content?: string;
  vod_play_from?: string;
  vod_play_url?: string;
  /** 跨站搜索时注入的站点上下文 */
  __siteId?: string;
  __siteName?: string;
  [key: string]: unknown;
}

export interface Category {
  type_id: string | number;
  type_name: string;
}

/** 一条播放线路及其剧集 */
export interface PlayLine {
  name: string;
  episodes: Array<{ title: string; url: string }>;
}

/** 影视站点（苹果CMS vod API） */
export interface TvSite {
  id: string;
  siteKey: string;
  name: string;
  /** 0=XML 接口 1=JSON 接口 */
  type: number;
  api: string;
  searchable: number;
  quickSearch: number;
  filterable: number;
  ext: string | null;
  jar: string | null;
  sort: number;
  /** 所属订阅 id，预置源为 'preset' */
  sourceId: string;
}

/** 直播源 */
export interface TvLive {
  id: string;
  name: string;
  /** 0=M3U 1=TXT */
  type: number;
  url: string;
  epg: string | null;
  sort: number;
  sourceId: string;
}

/** 解析接口 */
export interface TvParse {
  id: string;
  name: string;
  /** 0=网页嗅探（iframe）3=JSON 解析（代理提取直链） */
  type: number;
  url: string;
  ext: string | null;
  sort: number;
  sourceId: string;
}

/** 一条 TVBox 订阅（浏览器本地持久化） */
export interface Subscription {
  id: string;
  name: string;
  url: string;
  addedAt: number;
}

export interface M3UChannel {
  name: string;
  logo: string;
  url: string;
}

/** 代理/直连失败的统一错误结构（与原 PHP error_type 对齐） */
export class SourceError extends Error {
  errorType: string;
  constructor(message: string, errorType: string) {
    super(message);
    this.errorType = errorType;
  }
}
