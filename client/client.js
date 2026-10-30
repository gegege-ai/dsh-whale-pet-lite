/**
 * 小鲸鱼桌宠 · 客户端（原创 · MIT · gegege-ai）
 *
 * 做法：**不挂 React 渲染树**，直接把桌宠塞进 document.body（position:fixed 的独立容器）。
 * 资源走主机路由 /plugins/whale-pet/asset/*，所以只剩一份源码（demo/whale.js）。
 *
 * ⚠ 注入时机：DSH 客户端目前能稳定挂载的入口是设置页那个 client 包
 *   （package.json 的 dsh.client.inject = @deepseek-ai/dsh-client-ui-settings）。
 *   ⇒ 打开过一次设置页之后鲸鱼就会常驻（apply 只跑一次，注入后不再依赖设置页）。
 *   如果以后 DSH 提供"全局 overlay"槽位，把 apply 里的挂载换成那个槽位即可。
 */
window.__ModuleLoader__.load({
  id: 'dsh-whale-pet-lite',
  factory: () => {
    var module = { exports: {} };
    var exports = module.exports;

    var BASE = '/plugins/whale-pet';
    var mounted = false;

    function loadCss() {
      if (document.querySelector('link[data-whale-pet-plugin]')) return;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = BASE + '/asset/whale.css';
      link.setAttribute('data-whale-pet-plugin', '1');
      document.head.appendChild(link);
    }

    function boot() {
      loadCss();
      if (window.whalePet || document.getElementById('whale-pet-plugin-loader')) return;
      var s = document.createElement('script');
      s.id = 'whale-pet-plugin-loader';
      s.src = BASE + '/asset/whale.js';
      s.onload = function () {
        try {
          if (!window.whalePet) return;
          window.whalePet.mount();
          mounted = true;
          // 顺手同步一次主机侧状态（失败不影响）
          fetch(BASE + '/state').then(function (r) { return r.json(); }).then(function (j) {
            if (j && j.state) window.whalePet.setState(j.state);
          }).catch(function () { /* ignore */ });
        } catch (e) { /* 静默：桌宠挂了不能影响主界面 */ }
      };
      s.onerror = function () { /* 静默 */ };
      document.head.appendChild(s);
    }

    exports.name = 'whale-pet-client';
    exports.inject = [];
    exports.apply = function () {
      try {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', boot, { once: true });
        } else {
          boot();
        }
      } catch (e) { /* ignore */ }
    };

    return module.exports;
  },
});
