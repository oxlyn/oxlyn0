import type { M3UChannel } from './types';

/**
 * 直播源文本解析：从原版 app.js（141-190 行）等价移植。
 */

/** 解析 M3U：#EXTINF:-1 tvg-name="x" tvg-logo="y",频道名 + 下一行 URL */
export function parseM3U(content: string): M3UChannel[] {
  const lines = (content || '').split(/\r?\n/);
  const channels: M3UChannel[] = [];
  let current: M3UChannel | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#EXTINF')) {
      const nameMatch = trimmed.match(/,\s*([^,]*)$/);
      const logoMatch = trimmed.match(/tvg-logo="([^"]*)"/);
      const tvgNameMatch = trimmed.match(/tvg-name="([^"]*)"/);
      current = {
        name: (nameMatch && nameMatch[1]) || (tvgNameMatch && tvgNameMatch[1]) || '未知频道',
        logo: (logoMatch && logoMatch[1]) || '',
        url: '',
      };
    } else if (!trimmed.startsWith('#')) {
      if (current) {
        current.url = trimmed;
        channels.push(current);
        current = null;
      } else {
        // 无 EXTINF 的纯 URL 行，按未知频道处理
        channels.push({ name: `频道${channels.length + 1}`, logo: '', url: trimmed });
      }
    }
  }
  return channels;
}

/** 解析 TXT 格式（每行 "频道名,URL"，# 开头为分组注释行跳过） */
export function parseTXT(content: string): M3UChannel[] {
  const lines = (content || '').split(/\r?\n/);
  const channels: M3UChannel[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const commaIdx = trimmed.indexOf(',');
    if (commaIdx === -1) continue;
    const name = trimmed.substring(0, commaIdx).trim();
    const url = trimmed.substring(commaIdx + 1).trim();
    if (name && url) {
      channels.push({ name, logo: '', url });
    }
  }
  return channels;
}

/** 按内容自动选择解析器 */
export function parsePlaylist(content: string): M3UChannel[] {
  return content.includes('#EXTINF') ? parseM3U(content) : parseTXT(content);
}
