/**
 * 通用 Ruffle 挂载脚本：画面按游戏原始比例等比缩放，窗口变化自适应，
 * 全屏时游戏主界面刚好铺满整屏（居中、不变形）。
 *
 * 页面需提供结构：
 *   <div id="stage"><div id="player"></div></div>
 * 然后调用 mountFlashPlayer("xxx.swf")。
 *
 * 全屏方式：右上角按钮、按 F 键、或播放器右键菜单；Esc / 再按 F 退出。
 */
(function () {
  "use strict";

  // 游戏舞台原始尺寸（SWF 头解析：640x448，比例 10:7）
  const GAME_W = 640;
  const GAME_H = 448;

  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function requestFs(stage) {
    if (stage.requestFullscreen) return stage.requestFullscreen();
    if (stage.webkitRequestFullscreen) return stage.webkitRequestFullscreen();
    return Promise.reject(new Error("浏览器不支持全屏 API"));
  }

  function exitFs() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    return Promise.reject(new Error("浏览器不支持全屏 API"));
  }

  window.mountFlashPlayer = async function (swfUrl) {
    const stage = document.getElementById("stage");
    const holder = document.getElementById("player");
    if (!stage || !holder) throw new Error("页面缺少 #stage / #player 结构");

    // 把缩放尺寸应用到画面容器：全屏时铺满整屏，窗口时填满可视区域
    function resize() {
      const availW = window.innerWidth;
      const availH = window.innerHeight;
      // 过渡态（面板隐藏/调整中）窗口尺寸可能短暂为 0，此时不应用
      if (!availW || !availH) return;
      const k = Math.min(availW / GAME_W, availH / GAME_H);
      holder.style.width = GAME_W * k + "px";
      holder.style.height = GAME_H * k + "px";
      // SWF 自带 noScale（内容按舞台原始像素绘制），播放器固定原始尺寸后整体等比放大
      player.style.transform = "scale(" + k + ")";
    }

    function syncState() {
      const on = !!fsElement();
      document.body.classList.toggle("fs", on);
      btn.textContent = on ? "退出全屏 (F)" : "全屏 (F)";
      btn.title = "切换全屏（F 键 / Esc 退出）";
      resize();
      player && player.focus && player.focus();
    }

    async function toggle() {
      try {
        if (fsElement()) await exitFs();
        else await requestFs(stage);
      } catch (e) {
        console.warn("全屏切换失败:", e);
      }
    }

    // 右上角悬浮全屏按钮（自动隐藏式，不挡操作）
    const btn = document.createElement("button");
    btn.id = "fs-btn";
    btn.type = "button";
    btn.textContent = "全屏 (F)";
    btn.title = "切换全屏（F 键 / Esc 退出）";
    btn.addEventListener("click", toggle);
    stage.appendChild(btn);

    // F 键不在游戏键位（WASD/JKUIO）中，安全；忽略按住重复触发
    window.addEventListener("keydown", (e) => {
      if ((e.key === "f" || e.key === "F") && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
        toggle();
      }
    });

    document.addEventListener("fullscreenchange", syncState);
    document.addEventListener("webkitfullscreenchange", syncState);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", resize);
    // 兜底：页面加载早期窗口尺寸可能为 0（隐藏/过渡态）且事件不再触发，
    // 短轮询直到成功应用一次真实尺寸为止
    let tries = 0;
    const timer = setInterval(() => {
      resize();
      if (holder.style.width || ++tries > 100) clearInterval(timer);
    }, 100);
    // 兜底：监听文档尺寸变化重算
    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(document.documentElement);
    }

    // 挂载 Ruffle 播放器
    window.RufflePlayer = window.RufflePlayer || {};
    const ruffle = window.RufflePlayer.newest();
    const player = ruffle.createPlayer();
    // 播放器固定为舞台原始尺寸：SWF 无论用 noScale 还是 showAll，内容都恰好铺满播放器
    player.style.width = GAME_W + "px";
    player.style.height = GAME_H + "px";
    player.style.transformOrigin = "0 0";
    holder.appendChild(player);
    resize();

    // 关键：Ruffle 只在加载时按元素尺寸计算缩放，必须等容器有真实尺寸后再加载
    async function waitLayoutReady() {
      for (let i = 0; i < 100; i++) {
        resize();
        if (holder.style.width) return;
        await new Promise((r) => setTimeout(r, 50));
      }
    }

    try {
      await waitLayoutReady();
      await player.load(swfUrl);
    } catch (e) {
      holder.innerHTML =
        '<p style="color:#e08080;padding:40px">加载失败: ' + e + "</p>";
      return null;
    }

    player.focus();
    return player;
  };
})();
