(() => {
  let isHijacking = true;
  
  // 核心解析：抓取文本并包装成绝美的 HTML/CSS 卡片
  async function parseXhs(url) {
    const proxies = [
      `https://api.codetabs.com/v1/proxy?quest=${url}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    ];

    let html = "";
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { timeout: 5000 });
        if (res.ok) {
          const data = await res.text();
          html = proxy.includes('allorigins') ? JSON.parse(data).contents : data;
          if (html && html.includes('<title>')) break; 
        }
      } catch (e) {}
    }

    // 默认兜底文案
    let title = '一篇加密笔记';
    let desc = '这篇笔记被小红书隐藏了，只能在 App 里查看哦。';

    if (html && !html.includes('验证码') && !html.includes('403 Forbidden')) {
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      title = titleMatch ? titleMatch[1].replace(/\s*-\s*小红书.*/i, '') : '一篇有趣的笔记';
      
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                        html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
      desc = descMatch ? descMatch[1] : '这可能是一组好看的图集或视频~';
    }

    // ✨ 核心美化前端：手写小红书风格的精美 UI 卡片 (使用内联 CSS)
    const cardHtml = `
<div style="max-width: 320px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin: 10px 0; font-family: sans-serif;">
  <div style="background: #ff2442; padding: 6px 12px; display: flex; align-items: center;">
    <span style="color: #ffffff; font-size: 12px; font-weight: bold; letter-spacing: 1px;">📕 小红书 · 笔记分享</span>
  </div>
  <div style="padding: 12px 14px;">
    <div style="font-size: 15px; font-weight: 600; color: #222222; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
      ${title}
    </div>
    <div style="font-size: 13px; color: #666666; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
      ${desc}
    </div>
  </div>
</div>
这是我刚看到的小红书，你觉得怎么样？
`;
    // 注意：把多余的空格和换行压缩一下，防止影响 Markdown 引擎
    return cardHtml.trim().replace(/\n/g, ''); 
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
            showToast("⏳ 正在抽取笔记生成分享卡片...");
            el.disabled = true;

            try {
              const parsedHtml = await parseXhs(url);
              
              // 替换输入框内容为我们写好的精美 HTML 代码
              el.value = text.replace(url, parsedHtml);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              
              // 延迟 150 毫秒后自动发送
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
              showToast("解析失败，请检查网络");
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
    name: "📕 小红书外挂",
    version: "4.0.0",
    apps: [
      {
        id: "roche-xhs-parser-home",
        name: "控制台",
        icon: "extension",
        async mount(container, roche) {
          container.innerHTML = `<div style="padding: 20px;">
            <h2 style="color: #ff2442;">📕 小红书沉浸分享版 v4.0</h2>
            <p>已启用前台 HTML/CSS 原生渲染与自动发送。</p >
          </div>`;
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
