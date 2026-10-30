/* 小鲸鱼桌宠 · 原创实现（MIT · gegege-ai）
 * 纯原生 JS + 内联 SVG，无任何第三方素材 / 依赖。
 * 暴露 window.whalePet：
 *   setState('idle'|'thinking'|'working'|'waiting'|'error')
 *   show() / hide() / destroy() / move(x, y)
 */
(function (global) {
  'use strict';

  var STORE_KEY = 'whale-pet.v1';
  var SIZE_W = 148, SIZE_H = 197, SIZE = SIZE_W;
  var MARGIN = 20;
  var STATES = ['idle', 'thinking', 'working', 'waiting', 'error'];
  var BADGE = { idle: '', thinking: '◌', working: '⌨', waiting: '!', error: '×' };

  var WHALE_SVG = '<svg class="whale-body" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 176" width="132" height="176" aria-hidden="true"><defs><linearGradient id="g1" gradientUnits="userSpaceOnUse" x1="84" y1="110" x2="126" y2="158"><stop offset="0%" stop-color="#2a6ed0"/><stop offset="100%" stop-color="#4c9dff"/></linearGradient><linearGradient id="g2" gradientUnits="userSpaceOnUse" x1="66" y1="10" x2="66" y2="106"><stop offset="0%" stop-color="#1b3a6e"/><stop offset="100%" stop-color="#3f8ae8"/></linearGradient><linearGradient id="g3" gradientUnits="userSpaceOnUse" x1="34" y1="58" x2="30" y2="150"><stop offset="0%" stop-color="#1b3a6e"/><stop offset="100%" stop-color="#3f8ae8"/></linearGradient><linearGradient id="g4" gradientUnits="userSpaceOnUse" x1="98" y1="58" x2="102" y2="150"><stop offset="0%" stop-color="#1b3a6e"/><stop offset="100%" stop-color="#3f8ae8"/></linearGradient><linearGradient id="g5" gradientUnits="userSpaceOnUse" x1="66" y1="124" x2="66" y2="158"><stop offset="0%" stop-color="#2b3654"/><stop offset="100%" stop-color="#1f2942"/></linearGradient><linearGradient id="g6" gradientUnits="userSpaceOnUse" x1="66" y1="124" x2="66" y2="157"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#eaf3ff"/></linearGradient><linearGradient id="g7" gradientUnits="userSpaceOnUse" x1="66" y1="90" x2="66" y2="128"><stop offset="0%" stop-color="#2b3654"/><stop offset="100%" stop-color="#202a42"/></linearGradient><linearGradient id="g8" gradientUnits="userSpaceOnUse" x1="66" y1="13" x2="66" y2="54"><stop offset="0%" stop-color="#2a63b8"/><stop offset="100%" stop-color="#4d9bf0"/></linearGradient><linearGradient id="g9" gradientUnits="userSpaceOnUse" x1="34" y1="46" x2="41" y2="90"><stop offset="0%" stop-color="#1b3a6e"/><stop offset="100%" stop-color="#2a63b8"/></linearGradient><linearGradient id="g10" gradientUnits="userSpaceOnUse" x1="98" y1="46" x2="91" y2="90"><stop offset="0%" stop-color="#1b3a6e"/><stop offset="100%" stop-color="#2a63b8"/></linearGradient><linearGradient id="g11" gradientUnits="userSpaceOnUse" x1="12" y1="55" x2="40" y2="80"><stop offset="0%" stop-color="#2a6ed0"/><stop offset="100%" stop-color="#4c9dff"/></linearGradient><linearGradient id="g12" gradientUnits="userSpaceOnUse" x1="120" y1="55" x2="92" y2="80"><stop offset="0%" stop-color="#2a6ed0"/><stop offset="100%" stop-color="#4c9dff"/></linearGradient><linearGradient id="g13" gradientUnits="userSpaceOnUse" x1="54" y1="58.4" x2="54" y2="75.6"><stop offset="0%" stop-color="#2f6fd8"/><stop offset="100%" stop-color="#9ee0ff"/></linearGradient><linearGradient id="g14" gradientUnits="userSpaceOnUse" x1="78" y1="58.4" x2="78" y2="75.6"><stop offset="0%" stop-color="#2f6fd8"/><stop offset="100%" stop-color="#9ee0ff"/></linearGradient></defs><g id="tail"><path d="M84 146C96 148 110 142 116 130C122 134 128 144 126 152C124 158 112 160 100 157C92 155 86 152 84 146Z" fill="url(#g1)"/><path d="M116 130C112 122 114 112 122 110C127 114 128 124 125 130Z" fill="#4c9dff" opacity="0.9"/></g><g id="hair-back"><path d="M36 48C34 22 48 10 66 10C84 10 98 22 96 48C98 62 99 78 97 92C95 102 88 106 81 102C74 106 58 106 51 102C44 106 37 102 35 92C33 78 34 62 36 48Z" fill="url(#g2)" stroke="#101c33" stroke-width="1.1" stroke-linejoin="round"/><path d="M40 30C48 18 84 18 92 30C84 24 48 24 40 30Z" fill="#79c4ff" opacity="0.45"/><path d="M38 58C30 76 21 96 25 114C27 124 18 132 20 143C22 152 31 157 38 151C45 144 43 135 41 127C36 110 36 88 42 62Z" fill="url(#g3)" stroke="#101c33" stroke-width="1.1" stroke-linejoin="round"/><path d="M94 58C102 76 111 96 107 114C105 124 114 132 112 143C110 152 101 157 94 151C87 144 89 135 91 127C96 110 96 88 90 62Z" fill="url(#g4)" stroke="#101c33" stroke-width="1.1" stroke-linejoin="round"/><path d="M34 86C29 108 28 128 31 142C33 126 33 104 37 88Z" fill="#b6e4ff" opacity="0.42"/><path d="M98 86C103 108 104 128 101 142C99 126 99 104 95 88Z" fill="#b6e4ff" opacity="0.42"/><path d="M36 96C31 116 31 134 34 146C35 132 35 114 38 98Z" fill="#1b3a6e" opacity="0.32"/><path d="M96 96C101 116 101 134 98 146C97 132 97 114 94 98Z" fill="#1b3a6e" opacity="0.32"/></g><g id="legL"><rect x="52" y="148" width="11.5" height="18" rx="5.4" fill="#ffe3d2"/><rect x="52.5" y="141" width="10.5" height="26" rx="4.4" fill="#f8fbff"/><ellipse cx="57.75" cy="167.5" rx="10" ry="5.4" fill="#161c2e"/></g><g id="legR"><rect x="69" y="148" width="11.5" height="18" rx="5.4" fill="#ffe3d2"/><rect x="69.5" y="141" width="10.5" height="26" rx="4.4" fill="#f8fbff"/><ellipse cx="74.75" cy="167.5" rx="10" ry="5.4" fill="#161c2e"/></g><g id="skirt"><path d="M43 124C42 132 38 143 36 152C50 158 82 158 96 152C94 143 90 132 89 124Z" fill="url(#g5)"/><path d="M57 126C56 136 55 145 54 153C55 153.6 56 153.8 57 153.6C58 145 59 136 60 126Z" fill="#161c2e" opacity="0.5"/><path d="M75 126C76 136 77 145 78 153C77 153.6 76 153.8 75 153.6C74 145 73 136 72 126Z" fill="#161c2e" opacity="0.5"/><path d="M36 151C41 155.4 45 152.6 49 155C53 157.4 57 154.6 61 157C65 159.4 69 156.6 73 159C77 161.4 81 158.6 85 161C89 158.6 93 155.4 96 151C96 156.4 95 159.4 93 160.6C80 166.6 52 166.6 39 160.6C37 159.4 36 156.4 36 151Z" fill="#f8fbff" opacity="0.97"/><path d="M56 106C56 112 55 118 54 124C61 126.6 71 126.6 78 124C77 118 76 112 76 106C70 103.8 62 103.8 56 106Z" fill="#f8fbff"/><path d="M54 124C53 136 51 145 49 152C59 156.6 73 156.6 83 152C81 145 79 136 78 124Z" fill="url(#g6)"/><path d="M49 152C55 155.4 59 152.8 63 155.2C67 157.6 71 155 75 157.4C78 159.4 81 157 83 152C83 155.6 82 157.8 81 159C71 163.2 61 163.2 51 159C50 157.8 49 155.6 49 152Z" fill="#eff6ff"/><path d="M44 121C58 117.4 74 117.4 88 121C88 124.4 88 126.4 87 127.4C74 124 58 124 45 127.4C44 126.4 44 124.4 44 121Z" fill="#161c2e"/></g><g id="body"><rect x="59" y="84" width="14" height="14" rx="6" fill="#f0c0ab"/><path d="M48 96C48 92 56 90 66 90C76 90 84 92 84 96C86 106 86 118 84 124C74 128 58 128 48 124C46 118 46 106 48 96Z" fill="url(#g7)"/><path d="M52 92C55 99 77 99 80 92C76 88 56 88 52 92Z" fill="#f8fbff"/><path d="M53 92C56 95.6 76 95.6 80 92C79 95.4 76 97.6 73 97.6C71 95.4 61 95.4 59 97.6C56 97.6 54 95.4 53 92Z" fill="#e4efff"/><path d="M66 101C62 97 56.6 98 56.6 102C56.6 106 62 105 66 103C70 105 75.4 106 75.4 102C75.4 98 70 97 66 101Z" fill="#4c9dff"/><ellipse cx="66" cy="102.4" rx="2.2" ry="2.4" fill="#2a6ed0"/></g><g id="armL"><path d="M47 110C41 120 34 130 37 137" fill="none" stroke="#ffe3d2" stroke-width="8.6" stroke-linecap="round"/><ellipse cx="37.2" cy="137.6" rx="4.4" ry="4.2" fill="#ffe3d2"/><path d="M37.4 102.4C55 100 56.4 114 46.4 117.4C39 118.6 35 111 37.4 102.4Z" fill="#25304d"/><path d="M34.6 129.8C41.4 131 41.6 138.2 37.4 140" fill="none" stroke="#f8fbff" stroke-width="4.6" stroke-linecap="round"/></g><g id="armR"><path d="M85 110C91 120 98 130 95 137" fill="none" stroke="#ffe3d2" stroke-width="8.6" stroke-linecap="round"/><ellipse cx="94.8" cy="137.6" rx="4.4" ry="4.2" fill="#ffe3d2"/><path d="M94.6 102.4C77 100 75.6 114 85.6 117.4C93 118.6 97 111 94.6 102.4Z" fill="#25304d"/><path d="M97.4 129.8C90.6 131 90.4 138.2 94.6 140" fill="none" stroke="#f8fbff" stroke-width="4.6" stroke-linecap="round"/></g><g id="head"><path d="M36 56C36 38 46 32 66 32C86 32 96 38 96 56C96 72 83 88 66 89C49 88 36 72 36 56Z" fill="#ffe3d2" stroke="#101c33" stroke-width="1.1" stroke-linejoin="round"/><ellipse cx="50" cy="74" rx="7.6" ry="7.6" fill="#ffd7bf" opacity="0.5"/><ellipse cx="82" cy="74" rx="7.6" ry="7.6" fill="#ffd7bf" opacity="0.5"/><path d="M62.8 77.3C64.6 80.7 67.4 80.7 69.2 77.3C67.4 79.1 64.6 79.1 62.8 77.3Z" fill="#a83c3a" opacity="0.8"/><ellipse cx="42.5" cy="73.5" rx="5.6" ry="3.1" fill="#ff9db1" opacity="0.4"/><ellipse cx="89.5" cy="73.5" rx="5.6" ry="3.1" fill="#ff9db1" opacity="0.4"/></g><g id="hair-front"><path d="M34 53C33 26 47 13 66 13C85 13 99 26 98 53C95 49 90 46 85 45C79 46 73 48 67 48C61 48 55 49 49 50C44 50 39 50 34 53Z" fill="url(#g8)" stroke="#101c33" stroke-width="1" stroke-linejoin="round"/><path d="M43 25C50 16 64 13 77 17C66 15 52 19 45 27Z" fill="#b6e4ff" opacity="0.6"/><path d="M37 46C31 58 31 72 35 84C37 90 43 89 43 83C44 72 43 58 42 48Z" fill="url(#g9)"/><path d="M95 46C101 58 101 72 97 84C95 90 89 89 89 83C88 72 89 58 90 48Z" fill="url(#g10)"/><path d="M24 62C29.73 56.98 36.03 60.19 38.19 66.85C40.05 72.56 34.96 76.31 29.28 75.01C24.86 74.34 22.67 70.84 22.69 67.68C20.46 70.51 16.65 71.75 13.82 69.51C15.44 64.78 18.63 61.64 24 62Z" fill="url(#g11)"/><path d="M108 62C102.27 56.98 95.97 60.19 93.81 66.85C91.95 72.56 97.04 76.31 102.72 75.01C107.14 74.34 109.33 70.84 109.31 67.68C111.54 70.51 115.35 71.75 118.18 69.51C116.56 64.78 113.37 61.64 108 62Z" fill="url(#g12)"/></g><g id="eyeL" style="transform-origin:54px 66px"><path d="M46.4 65.6C46.4 55.2 61.6 55.2 61.6 65.6C61.6 76.6 46.4 76.6 46.4 65.6Z" fill="#f8fbff"/><ellipse cx="54" cy="67" rx="7.9" ry="9.4" fill="#141d31" opacity="0.85"/><ellipse cx="54" cy="67.2" rx="7" ry="8.3" fill="url(#g13)"/><ellipse cx="54.3" cy="68.4" rx="2.6" ry="3.2" fill="#123a6b" opacity="0.55"/><path d="M45.4 62.4C46.2 53.4 61.8 53.4 62.6 62.1C61.4 55.6 46.6 55.6 45.4 62.4Z" fill="#141d31"/><ellipse cx="51.6" cy="63" rx="2.5" ry="2.9" fill="#ffffff" opacity="0.96"/><ellipse cx="56.8" cy="70.2" rx="1.3" ry="1.5" fill="#d8f4ff" opacity="0.7"/><g id="pupilL"><ellipse cx="54.3" cy="67.6" rx="2.9" ry="3.6" fill="#0e1b30" opacity="0.96"/><ellipse cx="53.5" cy="66.4" rx="1" ry="1.2" fill="#eaf8ff" opacity="0.92"/></g></g><g id="eyeR" style="transform-origin:78px 66px"><path d="M70.4 65.6C70.4 55.2 85.6 55.2 85.6 65.6C85.6 76.6 70.4 76.6 70.4 65.6Z" fill="#f8fbff"/><ellipse cx="78" cy="67" rx="7.9" ry="9.4" fill="#141d31" opacity="0.85"/><ellipse cx="78" cy="67.2" rx="7" ry="8.3" fill="url(#g14)"/><ellipse cx="78.3" cy="68.4" rx="2.6" ry="3.2" fill="#123a6b" opacity="0.55"/><path d="M69.4 62.4C70.2 53.4 85.8 53.4 86.6 62.1C85.4 55.6 70.6 55.6 69.4 62.4Z" fill="#141d31"/><ellipse cx="75.6" cy="63" rx="2.5" ry="2.9" fill="#ffffff" opacity="0.96"/><ellipse cx="80.8" cy="70.2" rx="1.3" ry="1.5" fill="#d8f4ff" opacity="0.7"/><g id="pupilR"><ellipse cx="78.3" cy="67.6" rx="2.9" ry="3.6" fill="#0e1b30" opacity="0.96"/><ellipse cx="77.5" cy="66.4" rx="1" ry="1.2" fill="#eaf8ff" opacity="0.92"/></g></g><g id="acc"><path d="M40 36C46 22 86 22 92 36C86 29 46 29 40 36Z" fill="#f8fbff" opacity="0.96"/><ellipse cx="47" cy="27.4" rx="3.6" ry="3.4" fill="#f8fbff"/><ellipse cx="54" cy="24.4" rx="3.8" ry="3.6" fill="#f8fbff"/><ellipse cx="62" cy="23.2" rx="4" ry="3.8" fill="#f8fbff"/><ellipse cx="70" cy="23.6" rx="4" ry="3.8" fill="#f8fbff"/><ellipse cx="78" cy="25.6" rx="3.8" ry="3.6" fill="#f8fbff"/><ellipse cx="85" cy="29.2" rx="3.6" ry="3.4" fill="#f8fbff"/><path d="M59 135C59 131 62.4 128.6 66 128.6C69.6 128.6 73 131 73 135C73 139 69.6 141.4 66 141.4C62.4 141.4 59 139 59 135Z" fill="#4c9dff"/><path d="M73 133.6C77 131.2 79.6 134.6 77 137C75.6 138.4 74 135.4 73 133.6Z" fill="#2a6ed0"/><ellipse cx="62.2" cy="133.6" rx="1" ry="1" fill="#0b1220"/><path d="M66 141.4C67.6 144 70 144.6 71.6 143.2C69.8 145.8 67.2 145.2 66 141.4Z" fill="#4c9dff" opacity="0.9"/></g></svg>';

  var CSS_HREF = 'whale.css';

  function ensureCss(doc) {
    if (doc.querySelector('link[data-whale-pet]')) return;
    var link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_HREF;
    link.setAttribute('data-whale-pet', '1');
    doc.head.appendChild(link);
  }

  function readStore() {
    try { return JSON.parse(global.localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeStore(v) {
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) { /* 隐私模式忽略 */ }
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function create(options) {
    var opt = options || {};
    var doc = global.document;
    if (!doc) throw new Error('whalePet 需要浏览器环境');
    ensureCss(doc);

    var store = readStore();
    var state = 'idle';

    var root = doc.createElement('div');
    root.className = 'whale-pet';
    root.setAttribute('data-state', state);
    root.innerHTML = [
      '<div class="whale" role="button" tabindex="0" aria-label="小鲸鱼">',
      WHALE_SVG,
      '  <div class="badge" aria-hidden="true"></div>',
      '  <div class="bubbles"></div>',
      '</div>'
    ].join('');
    doc.body.appendChild(root);

    var whale = root.querySelector('.whale');
    var badge = root.querySelector('.badge');
    var bubbles = root.querySelector('.bubbles');
    var body = root.querySelector('.whale-body');
    var pupil = root.querySelector('#pupilL');

    var dot = doc.createElement('div');
    dot.className = 'whale-pet-dot';
    dot.title = '双击召回小鲸鱼';
    dot.style.display = 'none';
    doc.body.appendChild(dot);

    /* ---------- 位置 ---------- */
    var pos = { x: null, y: null };

    function viewport() {
      return { w: global.innerWidth || 1024, h: global.innerHeight || 768 };
    }
    function setXY(x, y, save) {
      var vp = viewport();
      pos.x = clamp(x, 4, Math.max(4, vp.w - SIZE_W - 4));
      pos.y = clamp(y, 4, Math.max(4, vp.h - SIZE_H - 4));
      root.style.left = pos.x + 'px';
      root.style.top = pos.y + 'px';
      root.style.right = 'auto';
      root.style.bottom = 'auto';
      if (save) writeStore({ x: pos.x, y: pos.y, hidden: root.getAttribute('data-hidden') === '1' });
    }
    function parkBottom() {
      var vp = viewport();
      var x = (typeof store.x === 'number') ? store.x : (vp.w - SIZE_W - 26);
      setXY(x, vp.h - SIZE_H - MARGIN, false);
    }
    parkBottom();

    /* ---------- 呼吸 / 眨眼 ---------- */
    var blinkTimer = null;
    function scheduleBlink() {
      if (blinkTimer) global.clearTimeout(blinkTimer);
      var wait = 3000 + Math.random() * 3000;       // 3~6 秒
      blinkTimer = global.setTimeout(function () {
        if (state === 'idle' || state === 'waiting' || state === 'error' || state === 'working') {
          whale.classList.add('blink');
          global.setTimeout(function () { whale.classList.remove('blink'); }, 130);
        }
        scheduleBlink();
      }, wait);
    }
    scheduleBlink();

    /* ---------- 跟随视线 ---------- */
    var rafPending = false;
    var pointer = { x: 0, y: 0, has: false };

    function applyGaze() {
      rafPending = false;
      if (!pointer.has) return;
      var rect = root.getBoundingClientRect();
      var cx = rect.left + rect.width * 0.72;   // 眼睛大约在右侧
      var cy = rect.top + rect.height * 0.46;
      var dx = pointer.x - cx;
      var dy = pointer.y - cy;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var k = Math.min(1, dist / 420);
      var px = (dx / dist) * 3.2 * k;
      var py = (dy / dist) * 2.6 * k;
      if (pupil) pupil.style.transform = 'translate(' + px.toFixed(2) + 'px,' + py.toFixed(2) + 'px)';
      if (body) body.style.transform = 'rotate(' + ((dx / Math.max(1, global.innerWidth)) * 5).toFixed(2) + 'deg)';
    }
    function onMove(e) {
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.has = true;
      if (!rafPending) { rafPending = true; global.requestAnimationFrame(applyGaze); }
    }
    global.addEventListener('mousemove', onMove, { passive: true });

    /* ---------- 泡泡 ---------- */
    function spawnBubbles(n) {
      if (!bubbles) return;
      var count = n || (3 + Math.floor(Math.random() * 3));   // 3~5 个
      for (var i = 0; i < count; i++) {
        (function (i) {
          var b = doc.createElement('div');
          b.className = 'bubble';
          b.style.setProperty('--bx', ((Math.random() * 36) - 18).toFixed(0) + 'px');
          b.style.marginLeft = ((Math.random() * 24) - 12).toFixed(0) + 'px';
          b.style.animationDelay = (i * 70) + 'ms';
          bubbles.appendChild(b);
          global.setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 2200);
        })(i);
      }
    }

    /* ---------- 点击 / 双击 ---------- */
    var clickTimer = null;
    var lastClick = 0;

    function jump() {
      whale.classList.remove('jump');
      void whale.offsetWidth;          // 重启动画
      whale.classList.add('jump');
      global.setTimeout(function () { whale.classList.remove('jump'); }, 700);
      spawnBubbles();
    }

    function hide() {
      root.setAttribute('data-hidden', '1');
      dot.style.display = 'block';
      writeStore({ x: pos.x, y: pos.y, hidden: true });
    }
    function show() {
      root.removeAttribute('data-hidden');
      dot.style.display = 'none';
      writeStore({ x: pos.x, y: pos.y, hidden: false });
      blinkOnce();
      spawnBubbles(3);
    }
    function blinkOnce() {
      whale.classList.add('blink');
      global.setTimeout(function () { whale.classList.remove('blink'); }, 140);
    }

    dot.addEventListener('dblclick', show);
    dot.addEventListener('click', function (e) { e.stopPropagation(); });

    whale.addEventListener('dblclick', function (e) {
      e.preventDefault();
      if (clickTimer) { global.clearTimeout(clickTimer); clickTimer = null; }
      hide();
    });

    /* ---------- 拖拽 + 惯性 + 回弹 ---------- */
    var drag = null;
    var inertiaFrame = null;

    function stopInertia() {
      if (inertiaFrame) { global.cancelAnimationFrame(inertiaFrame); inertiaFrame = null; }
    }

    whale.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      stopInertia();
      whale.setPointerCapture(e.pointerId);
      whale.classList.add('dragging');
      var rect = root.getBoundingClientRect();
      drag = {
        id: e.pointerId,
        startX: e.clientX, startY: e.clientY,
        originX: rect.left, originY: rect.top,
        lastX: e.clientX, lastY: e.clientY,
        lastT: performance.now(),
        vx: 0, vy: 0,
        moved: false
      };
    });

    whale.addEventListener('pointermove', function (e) {
      if (!drag || drag.id !== e.pointerId) return;
      var dx = e.clientX - drag.startX;
      var dy = e.clientY - drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      var now = performance.now();
      var dt = Math.max(1, now - drag.lastT);
      drag.vx = (e.clientX - drag.lastX) / dt * 16;
      drag.vy = (e.clientY - drag.lastY) / dt * 16;
      drag.lastX = e.clientX; drag.lastY = e.clientY; drag.lastT = now;
      setXY(drag.originX + dx, drag.originY + dy, false);
    });

    function endDrag(e) {
      if (!drag || drag.id !== e.pointerId) return;
      var moved = drag.moved;
      var vx = drag.vx, vy = drag.vy;
      drag = null;
      whale.classList.remove('dragging');
      if (!moved) {
        // 单击：延迟一点，避免和双击打架
        var now = Date.now();
        if (now - lastClick < 320) { lastClick = 0; return; }
        lastClick = now;
        if (clickTimer) global.clearTimeout(clickTimer);
        clickTimer = global.setTimeout(jump, 260);
        return;
      }
      glide(vx, vy);
    }
    whale.addEventListener('pointerup', endDrag);
    whale.addEventListener('pointercancel', endDrag);

    // 惯性滑一段，再回到底边
    function glide(vx, vy) {
      stopInertia();
      var steps = 0;
      function tick() {
        steps++;
        vx *= 0.92; vy *= 0.92;
        setXY(pos.x + vx, pos.y + vy, false);
        if (steps < 26 && (Math.abs(vx) + Math.abs(vy)) > 0.6) {
          inertiaFrame = global.requestAnimationFrame(tick);
        } else {
          inertiaFrame = null;
          snapBottom();
        }
      }
      inertiaFrame = global.requestAnimationFrame(tick);
    }

    function snapBottom() {
      var vp = viewport();
      var targetY = vp.h - SIZE_H - MARGIN;
      var startY = pos.y;
      var startX = pos.x;
      var t0 = performance.now();
      var dur = 420;
      function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);          // ease-out cubic
        setXY(startX, startY + (targetY - startY) * e, false);
        if (p < 1) {
          inertiaFrame = global.requestAnimationFrame(step);
        } else {
          inertiaFrame = null;
          writeStore({ x: pos.x, y: pos.y, hidden: false });
        }
      }
      inertiaFrame = global.requestAnimationFrame(step);
    }

    /* ---------- 状态 ---------- */
    function setState(next) {
      var name = String(next || 'idle').toLowerCase();
      if (STATES.indexOf(name) < 0) name = 'idle';
      state = name;
      root.setAttribute('data-state', name);
      badge.textContent = BADGE[name] || '';
      root.setAttribute('data-badge', name);
      if (name === 'thinking' || name === 'working') spawnBubbles(2);
    }

    /* ---------- 生命周期 ---------- */
    function onResize() { parkBottom(); }
    global.addEventListener('resize', onResize, { passive: true });

    function destroy() {
      global.removeEventListener('mousemove', onMove);
      global.removeEventListener('resize', onResize);
      if (blinkTimer) global.clearTimeout(blinkTimer);
      if (clickTimer) global.clearTimeout(clickTimer);
      stopInertia();
      if (root.parentNode) root.parentNode.removeChild(root);
      if (dot.parentNode) dot.parentNode.removeChild(dot);
    }

    if (store.hidden) hide();

    setState(opt.state || 'idle');

    return {
      el: root,
      dotEl: dot,
      setState: setState,
      show: show,
      hide: hide,
      destroy: destroy,
      getState: function () { return state; },
      jump: jump,
      bubbles: spawnBubbles
    };
  }

  var singleton = null;

  function mount(options) {
    if (singleton) return singleton;
    singleton = create(options);
    return singleton;
  }

  global.whalePet = {
    mount: mount,
    setState: function (s) {
      if (!singleton) mount();
      return singleton.setState(s);
    },
    show: function () { if (!singleton) mount(); singleton.show(); },
    hide: function () { if (!singleton) mount(); singleton.hide(); },
    destroy: function () { if (singleton) { singleton.destroy(); singleton = null; } },
    get instance() { return singleton; }
  };

  // 有 data-whale-pet="auto" 的页面自动挂载
  if (global.document && global.document.currentScript && global.document.currentScript.getAttribute('data-whale-pet') === 'auto') {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', function () { mount(); });
    } else {
      mount();
    }
  }
})(typeof window !== 'undefined' ? window : this);
