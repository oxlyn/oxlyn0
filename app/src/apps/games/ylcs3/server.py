#!/usr/bin/env python3
"""flash-player 本地服务器：静态托管本项目（mhhf 版播放页）。

Ruffle 需要 HTTP 才能加载 WASM/SWF（file:// 下 fetch 被浏览器拦截），
所以即使游戏完全自包含，也要通过本服务打开。
"""
import http.server
import os
import urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8901


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        print("[serve]", self.path[:80], fmt % args)

    def do_GET(self):
        path = urllib.parse.urlsplit(self.path).path
        # 兼容旧地址：/flash-player/*（旧目录）与旧文件名（player-mhhf.html / mhhf.swf）
        if path == "/flash-player" or path.startswith("/flash-player/"):
            dest = "/" + path[len("/flash-player/"):].lstrip("/")
            dest = dest.replace("player-mhhf.html", "index.html")
            dest = dest.replace("mhhf.swf", "ylcs3.swf")
            self.send_response(301)
            self.send_header("Location", dest)
            self.end_headers()
            return
        # 根路径由 SimpleHTTPRequestHandler 自动返回 index.html
        return super().do_GET()


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"serving {ROOT} on http://127.0.0.1:{PORT}/")
    server.serve_forever()
