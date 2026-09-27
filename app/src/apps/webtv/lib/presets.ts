import type { TvSite, TvLive, TvParse } from './types';

/**
 * 内置预置源：迁移自 CmsPro tvboxplayer 插件的种子数据（Data 目录下 site/live/parse seeds），
 * 即原版「内置默认源」配置下的已验证数据。id 采用 s/l/p 字母前缀加序号，保证 URL 友好。
 */

export const PRESET_SITES: TvSite[] = [
  { id: 's1', siteKey: '如意采集资源', name: '视频资源001', type: 1, api: 'https://cj.rycjapi.com/api.php/provide/vod/', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1001, sourceId: 'preset' },
  { id: 's2', siteKey: '极速资源', name: '视频资源002', type: 1, api: 'https://jszyapi.com/api.php/provide/vod/', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1002, sourceId: 'preset' },
  { id: 's3', siteKey: '暴風', name: '视频资源003', type: 1, api: 'https://bfzyapi.com/api.php/provide/vod', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1003, sourceId: 'preset' },
  { id: 's4', siteKey: '无尽资源', name: '视频资源004', type: 1, api: 'https://api.wujinapi.com/api.php/provide/vod/?ac=list', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1004, sourceId: 'preset' },
  { id: 's5', siteKey: '非凡', name: '视频资源005', type: 0, api: 'http://cj.ffzyapi.com/api.php/provide/vod/at/xml/', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1005, sourceId: 'preset' },
  { id: 's6', siteKey: '360', name: '视频资源006', type: 1, api: 'https://360zy.com/api.php/provide/vod?', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1006, sourceId: 'preset' },
  { id: 's7', siteKey: '牛牛资源', name: '视频资源007', type: 1, api: 'https://api.niuniuzy.me/api.php/provide/vod/', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1007, sourceId: 'preset' },
  { id: 's8', siteKey: '速播资源', name: '视频资源008', type: 1, api: 'https://subozy.com/api.php/provide/vod/?ac=list', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1008, sourceId: 'preset' },
  { id: 's9', siteKey: '豪华资源', name: '视频资源009', type: 1, api: 'https://hhzyapi.com/api.php/provide/vod/?ac=list', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1009, sourceId: 'preset' },
  { id: 's10', siteKey: 'gszy', name: '视频资源010', type: 1, api: 'https://api.guangsuapi.com/api.php/provide/vod/', searchable: 1, quickSearch: 1, filterable: 0, ext: null, jar: null, sort: 1010, sourceId: 'preset' },
  { id: 's11', siteKey: 'lzzy', name: '视频资源011', type: 1, api: 'https://cj.lziapi.com/api.php/provide/vod/', searchable: 1, quickSearch: 1, filterable: 0, ext: null, jar: null, sort: 1011, sourceId: 'preset' },
  { id: 's12', siteKey: 'snzy', name: '视频资源012', type: 1, api: 'https://suoniapi.com/api.php/provide/vod/', searchable: 1, quickSearch: 1, filterable: 0, ext: null, jar: null, sort: 1012, sourceId: 'preset' },
  { id: 's13', siteKey: '量子资源', name: '视频资源013', type: 1, api: 'https://lzizy1.com/api.php/provide/vod/', searchable: 1, quickSearch: 1, filterable: 0, ext: null, jar: null, sort: 1013, sourceId: 'preset' },
  { id: 's14', siteKey: '虎牙', name: '视频资源014', type: 1, api: 'https://www.huyaapi.com/api.php/provide/vod/from/hym3u8', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1014, sourceId: 'preset' },
  { id: 's15', siteKey: '百度', name: '视频资源015', type: 1, api: 'https://api.apibdzy.com/api.php/provide/vod/?ac=list', searchable: 1, quickSearch: 1, filterable: 0, ext: null, jar: null, sort: 1015, sourceId: 'preset' },
  { id: 's16', siteKey: '量子', name: '视频资源016', type: 0, api: 'https://cj.lziapi.com/api.php/provide/vod/at/xml/', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1016, sourceId: 'preset' },
  { id: 's17', siteKey: '索尼', name: '视频资源017', type: 1, api: 'https://suoniapi.com/api.php/provide/vod', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1017, sourceId: 'preset' },
  { id: 's18', siteKey: 'csp_SNzy', name: '视频资源018', type: 1, api: 'https://suoniapi.com/api.php/provide/vod/?ac=list', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1018, sourceId: 'preset' },
  { id: 's19', siteKey: '火狐', name: '视频资源019', type: 1, api: 'https://hhzyapi.com/api.php/provide/vod/', searchable: 1, quickSearch: 0, filterable: 1, ext: null, jar: null, sort: 1019, sourceId: 'preset' },
  { id: 's20', siteKey: 'taopian', name: '视频资源020', type: 1, api: 'https://taopianapi.com/cjapi/mc/vod/json.html', searchable: 1, quickSearch: 1, filterable: 0, ext: null, jar: null, sort: 1020, sourceId: 'preset' },
  { id: 's21', siteKey: '魔都资源', name: '视频资源021', type: 1, api: 'https://caiji.moduapi.cc/api.php/provide/vod/?ac=list', searchable: 1, quickSearch: 1, filterable: 1, ext: null, jar: null, sort: 1021, sourceId: 'preset' },
];

export const PRESET_LIVES: TvLive[] = [
  { id: 'l1', name: '驸马影视•ITV', type: 0, url: 'https://fastgit.cc/https://raw.githubusercontent.com/iTCoffe/Collect-iTV/main/Internet_iTV.m3u', epg: 'http://epg.112114.xyz/?ch={name}&date={date}', sort: 0, sourceId: 'preset' },
  { id: 'l2', name: 'develop202', type: 0, url: 'https://gh.927223.xyz/https://raw.githubusercontent.com/develop202/migu_video/refs/heads/main/interface.txt', epg: 'http://diyp5.112114.xyz/?ch={name}&date={date}', sort: 0, sourceId: 'preset' },
  { id: 'l3', name: '咪咕速播', type: 0, url: 'https://gh-proxy.com/https://raw.githubusercontent.com/develop202/migu_video/refs/heads/main/interface.txt', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 1, sourceId: 'preset' },
  { id: 'l4', name: '王子直播', type: 0, url: 'https://gitee.com/g1753462733/zb/raw/main/itvlist.txt', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 2, sourceId: 'preset' },
  { id: 'l5', name: '范明明（需开启V6网络）', type: 0, url: 'https://nos.netease.com/ysf/3d75a78a0fc7ede372c03598d6d10367.m3u', epg: null, sort: 2, sourceId: 'preset' },
  { id: 'l6', name: '清舒直播', type: 0, url: 'http://38.75.136.137:88/api/tvlist.php', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 3, sourceId: 'preset' },
  { id: 'l7', name: '超清测试', type: 0, url: 'https://gh-proxy.com/raw.githubusercontent.com/fuleishu/ceshi/refs/heads/main/aptv.m3u', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 4, sourceId: 'preset' },
  { id: 'l8', name: '全国组播', type: 0, url: 'https://gh-proxy.com/https://raw.githubusercontent.com/q1017673817/iptvz/refs/heads/main/zubo_all.txt', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 5, sourceId: 'preset' },
  { id: 'l9', name: '咪咕直播', type: 1, url: 'http://www.52top.com.cn:678/downloads/migu.txt', epg: null, sort: 8, sourceId: 'preset' },
  { id: 'l10', name: '稳定央卫', type: 0, url: 'https://gh-proxy.com/https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u', epg: null, sort: 9, sourceId: 'preset' },
  { id: 'l11', name: '江苏移动', type: 0, url: 'https://gitee.com/fuleishu/fulei/raw/master/zhiboceshi/ceshi1.txt', epg: null, sort: 10, sourceId: 'preset' },
  { id: 'l12', name: '肥羊虎牙一起看', type: 0, url: 'https://sub.ottiptv.cc/huyayqk.m3u', epg: null, sort: 11, sourceId: 'preset' },
  { id: 'l13', name: '肥羊B站直播', type: 0, url: 'https://sub.ottiptv.cc/bililive.m3u', epg: null, sort: 12, sourceId: 'preset' },
  { id: 'l14', name: '肥羊斗鱼一起看', type: 0, url: 'https://sub.ottiptv.cc/douyuyqk.m3u', epg: null, sort: 13, sourceId: 'preset' },
  { id: 'l15', name: '肥羊YY轮播', type: 0, url: 'https://sub.ottiptv.cc/yylunbo.m3u', epg: null, sort: 14, sourceId: 'preset' },
  { id: 'l16', name: '直播001', type: 0, url: 'https://v4.gh-proxy.org/https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 1001, sourceId: 'preset' },
  { id: 'l17', name: '直播002', type: 1, url: 'https://v4.gh-proxy.org/https://raw.githubusercontent.com/zbefine/iptv/main/iptv.txt', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 1002, sourceId: 'preset' },
  { id: 'l18', name: '直播004', type: 1, url: 'https://cdn.jsdelivr.net/gh/Guovin/iptv-api@gd/output/result.txt', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 1004, sourceId: 'preset' },
  { id: 'l19', name: '直播005', type: 0, url: 'https://v4.gh-proxy.org/https://raw.githubusercontent.com/zbefine/iptv/main/iptv.m3u', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 1005, sourceId: 'preset' },
  { id: 'l20', name: '直播006', type: 0, url: 'https://v4.gh-proxy.org/https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/result.m3u', epg: 'http://epg.51zmt.top:8000/api/diyp/?ch={name}&date={date}', sort: 1006, sourceId: 'preset' },
];

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 13; V2049A Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36';

export const PRESET_PARSES: TvParse[] = [
  { id: 'p1', name: '线路001', type: 3, url: 'https://jx.xmflv.com/?url=', ext: JSON.stringify({ header: { 'user-agent': MOBILE_UA } }), sort: 1001, sourceId: 'preset' },
  { id: 'p2', name: '线路002', type: 3, url: 'http://www.ckplayer.vip/jiexi/?url=', ext: null, sort: 1002, sourceId: 'preset' },
  { id: 'p3', name: '线路003', type: 3, url: 'https://www.pangujiexi.com/pangu/?url=', ext: null, sort: 1003, sourceId: 'preset' },
  { id: 'p4', name: '线路004', type: 3, url: 'https://jx.aidouer.net/?url=', ext: JSON.stringify({ header: { 'user-agent': 'Mozilla/5.0(Linux;Android13;V2049ABuild/TP1A.220624.014;wv)AppleWebKit/537.36(KHTML,likeGecko)Version/4.0Chrome/116.0.0.0MobileSafari/537.36', referer: 'https://jiejie.uk/' } }), sort: 1004, sourceId: 'preset' },
  { id: 'p5', name: '线路005', type: 3, url: 'https://jx.xyflv.cc/?url=', ext: JSON.stringify({ header: { 'user-agent': 'Mozilla/5.0(Linux;Android13;V2049ABuild/TP1A.220624.014;wv)AppleWebKit/537.36(KHTML,likeGecko)Version/4.0Chrome/116.0.0.0MobileSafari/537.36', referer: 'https://www.xyflv.cc/' } }), sort: 1005, sourceId: 'preset' },
  { id: 'p6', name: '线路006', type: 0, url: 'https://yparse.ik9.cc/index.php?url=', ext: JSON.stringify({ header: { 'user-agent': MOBILE_UA } }), sort: 1006, sourceId: 'preset' },
  { id: 'p7', name: '线路006', type: 0, url: 'https://cdn.zyc888.top/?url=', ext: null, sort: 1006, sourceId: 'preset' },
  { id: 'p8', name: '线路007', type: 0, url: 'https://jx.777jiexi.com/player/?url=', ext: null, sort: 1007, sourceId: 'preset' },
  { id: 'p9', name: '线路008', type: 0, url: 'https://jx.yparse.com/index.php?url=', ext: JSON.stringify({ header: { 'user-agent': MOBILE_UA } }), sort: 1008, sourceId: 'preset' },
  { id: 'p10', name: '线路009', type: 0, url: 'https://www.8090g.cn/?url=', ext: null, sort: 1009, sourceId: 'preset' },
  { id: 'p11', name: '线路010', type: 0, url: 'https://bd.jx.cn/?url=', ext: JSON.stringify({ header: { 'user-agent': MOBILE_UA } }), sort: 1010, sourceId: 'preset' },
  { id: 'p12', name: '线路011', type: 0, url: 'https://jx.77flv.cc/?url=', ext: JSON.stringify({ header: { 'user-agent': MOBILE_UA } }), sort: 1011, sourceId: 'preset' },
  { id: 'p13', name: '线路012', type: 0, url: 'https://www.playm3u8.cn/jiexi.php?url=', ext: JSON.stringify({ header: { 'user-agent': MOBILE_UA } }), sort: 1012, sourceId: 'preset' },
  { id: 'p14', name: '线路013', type: 0, url: 'https://jx.m3u8.tv/jiexi/?url=', ext: null, sort: 1013, sourceId: 'preset' },
  { id: 'p15', name: '线路014', type: 0, url: 'https://www.ckplayer.vip/jiexi/?url=', ext: null, sort: 1014, sourceId: 'preset' },
  { id: 'p16', name: '线路015', type: 0, url: 'https://www.8090g.cn/jiexi/?url=', ext: null, sort: 1015, sourceId: 'preset' },
];
