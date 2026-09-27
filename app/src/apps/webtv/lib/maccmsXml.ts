import { XMLParser } from 'fast-xml-parser';

/**
 * 苹果CMS XML → JSON 转换：等价移植自 PHP ProxyController::xmlToJson（163-374 行）。
 * 同构模块：Route Handler（Node）与浏览器降级路径共用 —— fast-xml-parser 纯 JS，
 * 编码转换用 TextDecoder（Node 18+ full-icu 与现代浏览器均支持 gbk/big5）。
 */

const FIELD_MAP: Record<string, string> = {
  id: 'vod_id',
  name: 'vod_name',
  pic: 'vod_pic',
  note: 'vod_remarks',
  year: 'vod_year',
  area: 'vod_area',
  director: 'vod_director',
  actor: 'vod_actor',
  type: 'vod_class',
  lang: 'vod_lang',
  des: 'vod_content',
};

// 需要跳过的非数据标签（dt/dl 单独处理播放线路）
const SKIP_TAGS = ['last', 'tid', 'state', 'dt', 'dl'];
const LIST_LEVEL_TAGS = ['page', 'pagecount', 'total', 'limit', 'pagesize', 'recordcount'];

/** 从字节流头部（ASCII 安全）探测 XML 声明的编码 */
export function detectXmlCharset(bytes: Uint8Array): string | null {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 256));
  const m = head.match(/<\?xml[^>]+encoding\s*=\s*["']([^"']+)["']/i);
  return m ? m[1].trim().toUpperCase() : null;
}

/** 按声明编码把字节流转成 UTF-8 文本；无法转换时返回 null */
export function decodeXmlBytes(bytes: Uint8Array, fallback = 'utf-8'): string | null {
  const declared = detectXmlCharset(bytes) || fallback.toUpperCase();
  let label: string;
  if (declared === 'UTF-8' || declared === 'UTF8') {
    label = 'utf-8';
  } else if (/^GB ?(2312|18030)?$/i.test(declared) || declared === 'GBK') {
    label = 'gb18030'; // 覆盖 gb2312/gbk/gb18030
  } else if (declared === 'BIG5') {
    label = 'big5';
  } else {
    label = declared.toLowerCase();
  }
  try {
    return new TextDecoder(label).decode(bytes);
  } catch {
    try {
      return new TextDecoder('utf-8').decode(bytes);
    } catch {
      return null;
    }
  }
}

type XmlNode = Record<string, unknown>;

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** 取元素文本（纯文本 / 带 #text / 带 __cdata） */
function nodeText(el: unknown): string {
  if (el === undefined || el === null) return '';
  if (typeof el === 'string') return el;
  if (typeof el === 'number' || typeof el === 'boolean') return String(el);
  const node = el as XmlNode;
  const text = node['__cdata'] ?? node['#text'];
  return text === undefined || text === null ? '' : String(text);
}

function makeParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
    cdataPropName: '__cdata',
    commentPropName: '__comment',
    processEntities: true,
  });
}

/** ac=type：<rss><class><ty id="1">电影</ty></class></rss> → {class:[{type_id,type_name}]} */
function xmlParseType(doc: XmlNode): Record<string, unknown> {
  const classNode = doc['class'];
  const items: Array<{ type_id: string; type_name: string }> = [];
  if (classNode && typeof classNode === 'object') {
    const node = classNode as XmlNode;
    for (const ty of asArray(node['ty'])) {
      const el = ty as XmlNode;
      items.push({
        type_id: String(el?.['@_id'] ?? ''),
        type_name: nodeText(ty),
      });
    }
  }
  return { class: items };
}

/** dt（逗号分隔线路名）+ dl>dd flag → vod_play_from / vod_play_url */
function xmlParsePlayData(video: XmlNode, raw: Record<string, string>, item: Record<string, string | number>): void {
  let playFrom = raw['dt'] ?? '';

  const playUrls: string[] = [];
  const ddFlags: string[] = [];
  const dl = video['dl'];
  if (dl && typeof dl === 'object') {
    for (const dd of asArray((dl as XmlNode)['dd'])) {
      const el = dd as XmlNode;
      const flag = String(el?.['@_flag'] ?? '');
      const content = nodeText(dd);
      if (content !== '') {
        playUrls.push(content);
        if (flag !== '') ddFlags.push(flag);
      }
    }
  }

  // dt 为空（detail 响应常见）时从 dd flag 提取线路名
  if (!playFrom && ddFlags.length > 0) {
    playFrom = ddFlags.join(',');
  }

  if (playFrom !== '') {
    // dt 逗号分隔 → 前端期望的 $$$ 分隔
    item['vod_play_from'] = playFrom.split(',').join('$$$');
  }
  if (playUrls.length > 0) {
    item['vod_play_url'] = playUrls.join('$$$');
  }
}

/** ac=detail/list：<rss><list page=..><video>...</video></list></rss> → 标准 vod JSON */
function xmlParseList(doc: XmlNode): Record<string, unknown> {
  const listNodeRaw = doc['list'] ?? doc;
  const listNode = (typeof listNodeRaw === 'object' ? listNodeRaw : {}) as XmlNode;

  const page = parseInt(String(listNode['@_page'] ?? '1'), 10) || 1;
  const pagecount = String(listNode['@_pagecount'] ?? '1');
  const total = String(listNode['@_total'] ?? listNode['@_recordcount'] ?? '0');
  const limit = String(listNode['@_limit'] ?? listNode['@_pagesize'] ?? '20');

  const list: Array<Record<string, string | number>> = [];
  for (const [tag, value] of Object.entries(listNode)) {
    if (tag.startsWith('@_') || tag.startsWith('__') || tag === '#text') continue;
    if (LIST_LEVEL_TAGS.includes(tag)) continue;
    for (const videoRaw of asArray(value)) {
      if (typeof videoRaw !== 'object' || videoRaw === null) continue;
      const video = videoRaw as XmlNode;
      const raw: Record<string, string> = {};
      for (const [field, val] of Object.entries(video)) {
        if (field.startsWith('@_') || field.startsWith('__')) continue;
        raw[field] = nodeText(val);
      }
      if (Object.keys(raw).length === 0) continue;

      const item: Record<string, string | number> = {};
      for (const [field, val] of Object.entries(raw)) {
        const mapped = FIELD_MAP[field];
        if (mapped) {
          item[mapped] = val;
        } else if (!SKIP_TAGS.includes(field)) {
          item[field] = val;
        }
      }
      xmlParsePlayData(video, raw, item);
      if (Object.keys(item).length > 0) list.push(item);
    }
  }

  return { code: 1, list, page, pagecount, total, limit };
}

/**
 * 转换入口。解析失败返回 null（调用方继续走透传/原始文本分支）。
 * @param rawXml 已解码为 UTF-8 的 XML 文本
 * @param ac     API 操作类型（type/detail/list 等）
 */
export function convertMacCmsXml(rawXml: string, ac: string): Record<string, unknown> | null {
  if (!rawXml || !rawXml.trim()) return null;
  try {
    const doc = makeParser().parse(rawXml) as XmlNode;
    const rss = (doc['rss'] as XmlNode) ?? doc;
    return ac === 'type' ? xmlParseType(rss) : xmlParseList(rss);
  } catch {
    return null;
  }
}
