(() => {
  let isHijacking = true;
  
  async function parseXhs(url) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    const html = data.contents || ''; 
    
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/\s*-\s*小红书.*/i, '') : '分享了一篇笔记';
    
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                      html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
    let desc = descMatch ? descMatch[1] : '没有获取到具体内容。';
    
    return `[分享小红书] 标题：《${title}》。内容摘要：${desc} —— 你觉得怎么样？`;
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
        const text = el.value || '';
        if (text.length > 10 && (text.includes('xiaohongshu') || text.includes('xhslink'))) {
          const xhsRegex = /https?:\/\/(?:www\.)?xiaohongshu\.com\/[^\s]+|https?:\/\/xhslink\.com\/[^\s]+/i;
          const match = text.match(xhsRegex);

          if (match && !el.dataset.xhsParsed) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const url = match[0];
            showToast("【小红书外挂】拦截成功！正在解析...");
            
            el.disabled = true;
            el.value = "⏳ 正在提取小红书内容，请稍等1~3秒...";
            el.dispatchEvent(new Event('input', { bubbles: true }));

            try {
              const parsedText = await parseXhs(url);
              el.value = text.replace(url, parsedText);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dataset.xhsParsed = "true";
              showToast("【小红书外挂】解析完毕！再次按回车发送");
            } catch (err) {
              showToast("解析失败，请检查链接");
              el.value = text;
              el.dispatchEvent(new Event('input', { bubbles: true }));
            } finally {
              el.disabled = false;
              el.focus();
            }
          } else if (el.dataset.xhsParsed) {
             setTimeout(() => { el.dataset.xhsParsed = ""; }, 500);
          }
        }
      }
    }
  }, true);

  window.RochePlugin.register({
    id: "roche-xhs-parser",
    name: "📕 小红书外挂",
    version: "1.0.3",
    apps: [
      {
        id: "roche-xhs-parser-home",
        name: "外挂控制台",
        icon: "extension",
        async mount(container, roche) {
          container.innerHTML = `<div style="padding: 20px; font-family: sans-serif;">
            <h2 style="color: #ff2442;">📕 小红书外挂运行中</h2>
            <p>去主聊天框粘贴链接，按回车即可自动解析。</p >
          </div>`;
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
