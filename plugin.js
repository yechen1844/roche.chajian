(() => {
  let isHijacking = true;

  // 强行超时打断器，限时4秒
  async function fetchWithTimeout(resource, timeout = 4000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  // 极速文本抓取 (3个代理同时竞速，秒出结果)
  async function getTextFast(url) {
    return new Promise((resolve, reject) => {
      const proxies = [
        `https://api.codetabs.com/v1/proxy?quest=${url}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      ];
      
      let failCount = 0;
      proxies.forEach(async (proxy) => {
        try {
          const res = await fetchWithTimeout(proxy, 4000);
          if (res.ok) {
            const data = await res.text();
            const html = proxy.includes('allorigins') ? JSON.parse(data).contents : data;
            if (html && !html.includes('验证码') && html.includes('<title>')) {
              const titleMatch = html.match(/<title>(.*?)<\/title>/i);
              const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                                html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
              resolve({
                title: titleMatch ? titleMatch[1].replace(/\s*-\s*小红书.*/i, '') : '一篇加密笔记',
                desc: descMatch ? descMatch[1] : '该笔记有隐私限制，建议直接打开 App 查看。'
              });
              return;
            }
          }
        } catch (e) {}
        failCount++;
        if (failCount === proxies.length) reject(new Error("文本抓取失败"));
      });
    });
  }

  function showToast(msg) {
    if (window.Roche && window.Roche.ui) window.Roche.ui.toast(msg);
    else if (window.roche && window.roche.ui) window.roche.ui.toast(msg);
  }

  document.addEventListener('keydown', async (e) => {
    if (!isHijacking) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      const el = e.target;
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        if (el.dataset.autoSend === "true") {
          setTimeout(() => { el.dataset.autoSend = ""; }, 100);
          return; 
        }

        const text = el.value || '';
        if (text.length > 5 && (text.includes('xiaohongshu') || text.includes('xhslink'))) {
          const xhsRegex = /https?:\/\/(?:www\.)?xiaohongshu\.com\/[^\s]+|https?:\/\/xhslink\.com\/[^\s]+/i;
          const match = text.match(xhsRegex);

          if (match) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const url = match[0];
            showToast("⚡ 正在极速抽取笔记文本...");
            el.disabled = true;

            try {
              // 1秒内拿到纯净文本
              const data = await getTextFast(url).catch(() => ({ 
                title: "分享了一篇笔记", desc: "该笔记有防爬虫限制，无法抓取摘要。" 
              }));
              
              // 自动清洗垃圾口令
              let cleanText = text
                .replace(/把口令拷走，打开【小红书】查看详情~/g, '')
                .replace(/\[新版小红书\]/g, '')
                .replace(/3 亿人的生活经验，都在小红书/g, '')
                .replace(url, '').trim(); 
              
              // 巧妙设计：如果用户说了话，把用户的话做成一个优雅的对话气泡框放进卡片里
              const userCommentHtml = cleanText ? `<div class="xh-u">💬 "${cleanText}"</div>` : '';
              
              // ==========================================
              // 完美结界：100% 纯代码单发，AI 读源码，肉眼看UI
              // ==========================================
              const css = `<style>.xh-w{display:block!important;width:100%;max-width:320px;min-width:260px;box-sizing:border-box;margin:8px 0;font-family:system-ui,-apple-system,sans-serif}.xh-b{background:rgba(30,30,35,0.6);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid rgba(255,36,66,0.25);border-radius:12px;overflow:hidden}.xh-h{display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,rgba(255,36,66,0.85) 0%,rgba(255,36,66,0.1) 100%);color:#fff;font-size:12px;font-weight:bold;letter-spacing:1px}.xh-c{padding:14px}.xh-t{font-size:15px;font-weight:600;color:#f0f0f0;margin-bottom:8px;line-height:1.5}.xh-d{font-size:13px;color:#aaa;line-height:1.6;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}.xh-u{padding:10px 14px;background:rgba(255,255,255,0.05);border-top:1px solid rgba(255,255,255,0.05);font-size:14px;color:#e2e8f0;font-style:italic}</style>`;
              
              const finalMsg = `${css}<div class="xh-w"><div class="xh-b"><div class="xh-h">📕 小红书 · 笔记分享</div><div class="xh-c"><div class="xh-t">${data.title}</div><div class="xh-d">${data.desc}</div></div>${userCommentHtml}</div></div>`;

              el.value = finalMsg;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              
              // 自动发送
              setTimeout(() => {
                el.dataset.autoSend = "true";
                el.disabled = false;
                el.focus(); 
                const enterEvent = new KeyboardEvent('keydown', {
                  key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
                });
                el.dispatchEvent(enterEvent);
                showToast("✨ 发送成功！");
              }, 150);

            } catch (err) {
              showToast("严重错误，请检查网络");
              el.disabled = false;
              el.focus();
            }
          }
        }
      }
    }
  }, true);

  window.RochePlugin.register({
    id: "roche-xhs-parser",
    name: "📕 小红书无图极简版",
    version: "9.0.0",
    apps: [
      {
        id: "roche-xhs-parser-home",
        name: "控制台",
        icon: "extension",
        async mount(container, roche) {
          container.innerHTML = `<div style="padding: 20px;">
            <h2 style="color: #ff2442;">📕 极速高定纯文本版 v9.0</h2>
            <p>已彻底剔除无效图片模块，单发完美卡片，AI可穿透阅读源码。</p>
          </div>`;
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
