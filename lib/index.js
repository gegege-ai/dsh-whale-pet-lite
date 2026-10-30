/**
 * 小鲸鱼桌宠 · 主机侧（原创 · MIT · gegege-ai）
 *
 * 只做两件事：
 *   1) 把 demo/ 里的静态文件挂到 /plugins/whale-pet/asset/*（客户端直接 <script>/<link> 引）
 *   2) 留一个状态接口：GET/POST /plugins/whale-pet/state（方便别处把状态推给桌宠）
 *
 * 状态：idle | thinking | working | waiting | error
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'whale-pet-host';
export const inject = ['webServer'];

const BASE = '/plugins/whale-pet';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSET_DIR = path.resolve(HERE, '..', 'demo');

const MIME = {
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8'
};

const VALID = new Set(['idle', 'thinking', 'working', 'waiting', 'error']);
let currentState = 'idle';
let updatedAt = Date.now();

function sendJson(res, code, body) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function sendFile(res, file) {
  try {
    const buf = fs.readFileSync(file);
    res.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-cache'
    });
    res.end(buf);
  } catch (e) {
    sendJson(res, 404, { ok: false, err: 'asset not found' });
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let buf = '';
    req.on('data', (c) => {
      buf += c;
      if (buf.length > 16 * 1024) req.destroy();
    });
    req.on('end', () => resolve(buf));
    req.on('error', () => resolve(''));
  });
}

export function apply(ctx) {
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'prefix',
      path: BASE,
      handler: async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://x');
        const pathname = url.pathname;
        const method = (req.method ?? 'GET').toUpperCase();

        if (pathname === BASE + '/state' && method === 'GET') {
          return sendJson(res, 200, { ok: true, state: currentState, updatedAt });
        }

        if (pathname === BASE + '/state' && method === 'POST') {
          const raw = await readBody(req);
          let next = '';
          try { next = String(JSON.parse(raw || '{}').state || ''); } catch (e) { next = ''; }
          if (!VALID.has(next)) return sendJson(res, 400, { ok: false, err: 'state 只能是 idle/thinking/working/waiting/error' });
          currentState = next;
          updatedAt = Date.now();
          return sendJson(res, 200, { ok: true, state: currentState, updatedAt });
        }

        // 静态资源：/plugins/whale-pet/asset/<文件名>（只允许 demo 目录里的白名单扩展名）
        if (pathname.startsWith(BASE + '/asset/') && method === 'GET') {
          const rel = pathname.slice((BASE + '/asset/').length);
          if (!/^[\w.-]+$/.test(rel)) return sendJson(res, 400, { ok: false, err: 'bad name' });
          const file = path.join(ASSET_DIR, rel);
          if (!file.startsWith(ASSET_DIR)) return sendJson(res, 400, { ok: false, err: 'bad path' });
          return sendFile(res, file);
        }

        // 根路径给个说明，方便在浏览器里自测
        if (pathname === BASE || pathname === BASE + '/') {
          res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
          return res.end('<!doctype html><meta charset="utf-8"><title>whale-pet</title>'
            + '<body style="font:14px sans-serif;background:#0b1220;color:#cfe6ff;padding:24px">'
            + '<h3>小鲸鱼桌宠 · 主机侧就绪</h3>'
            + '<p>demo：<a style="color:#7cc4ff" href="' + BASE + '/asset/index.html">/plugins/whale-pet/asset/index.html</a></p>'
            + '<p>状态：<code id="s">' + currentState + '</code></p>'
            + '<button onclick="fetch(\'' + BASE + '/state\',{method:\'POST\',headers:{\'content-type\':\'application/json\'},body:JSON.stringify({state:\'thinking\'})}).then(r=>r.json()).then(j=>document.getElementById(\'s\').textContent=j.state)">设为 thinking</button>'
            + '</body>');
        }

        return sendJson(res, 404, { ok: false, err: '未知路径：' + pathname });
      }
    })
  );
}

// 给自测用
export const _internal = { VALID, get state() { return currentState; } };
