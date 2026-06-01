(() => {
  let isHijacking = true;
  
  // 核心解析：调用 Microlink 强制屏幕快照，并输出极限单行 CSS 渲染代码
  async function parseXhs(url) {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
    
    let title = '分享了一篇笔记';
    let desc = '正在获取快照内容...';
    let imgUrl = '';

    try {
      const res = await fetch(apiUrl, { timeout: 15000 });
      const json = await res.json();
      if (json.status === 'success') {
        title = json.data.title || title;
        desc = json.data.description || desc;
        // 核心：强制提取 screenshot 快照，如果没有则降级提取原帖封面 image
        imgUrl = json.data.screenshot?.url || json.data.image?.url || '';
      }
    } catch (e) {
      desc = "快照获取超时，这篇笔记可能防爬虫级别过高。";
    }

    // 图片渲染模块（如果抓到了快照才渲染图块）
    const imgHtml = imgUrl ? `<div class="xh-img-box">< img src="${imgUrl}" class="xh-img"></div>` : '';
    
    // 【遵循红线 1 & 2 & 8 & 极光玻璃拟态】
    // 将所有 CSS 和 HTML 严格压缩在同一行，采用 .xh- 命名空间，强制 display:block
    const css = `<style>.xh-wrap{display:block!important;width:100%!important;max-width:320px;min-width:260px;box-sizing:border-box;margin:12px 0;font-family:-apple-system,BlinkMacSystemFont,sans-serif}.xh-box{position:relative;width:100%;background:rgba(250,250,252,0.1);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid rgba(255,36,66,0.25);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15),inset 0 0 0 1px rgba(255,255,255,0.1);overflow:hidden}.xh-hd{display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,rgba(255,36,66,0.85) 0%,rgba(255,36,66,0.1) 100%);color:#fff;font-size:12px;font-weight:bold;letter-spacing:1px}.xh-img-box{width:100%;max-height:220px;overflow:hidden;background:rgba(0,0,0,0.2);position:relative}.xh-img{width:100%;height:100%;object-fit:cover;display:block}.xh-bd{padding:12px 14px}.xh-tit{font-size:14px;font-weight:600;color:var(--roche-text-primary, #ddd);margin-bottom:6px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.xh-desc{font-size:12px;color:var(--roche-text-secondary, #999);line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}</style>`;
    
    const html = `${css}<div class="xh-wrap"><div class="xh-box"><div class="xh-hd">📕 小红书 · 网页快照</div>${imgHtml}<div class="xh-bd"><div class="xh-tit">${title}</div><div class="xh-desc">${desc}</div></div></div></div>你看这篇怎么样？`;
    
    // 最后的安全锁：强行抹杀可能存在的任何换行符
    return html.replace(/\n/g, '').replace(/\r/g, ''); 
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
            showToast("📸 正在云端渲染快照，约需 5~10 秒...");
            el.disabled = true;

            try {
              const parsedHtml = await parseXhs(url);
              el.value = text.replace(url, parsedHtml);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              
              // 延迟 150 毫秒自动发送
              setTimeout(() => {
                el.dataset.autoSend = "true";
                el.disabled = false;
                el.focus(); 
                const enterEvent = new KeyboardEvent('keydown', {
                  key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
                });
                el.dispatchEvent(enterEvent);
                showToast("✨ 快照渲染并发送成功！");
              }, 150);

            } catch (err) {
              showToast("快照解析失败，请检查网络");
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
    name: "📸 小红书快照外挂",
    version: "5.0.0",
    apps: [
      {
        id: "roche-xhs-parser-home",
        name: "控制台",
        icon: "extension",
        async mount(container, roche) {
          container.innerHTML = `<div style="padding: 20px;">
            <h2 style="color: #ff2442;">📸 小红书快照渲染版 v5.0</h2>
            <p>已应用极限单行压缩法则与微缩快照生成。</p >
          </div>`;
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
